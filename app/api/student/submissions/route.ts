import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyStudent } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * UNIFIED SUBMISSIONS NODE
 */
export async function GET() {
  try {
    const student = await verifyStudent(false);

    if (student.status !== 'approved') return NextResponse.json([]);

    const res = await query(
      `SELECT s.*, a.title as assignment_title
       FROM submissions s
       LEFT JOIN assignments a ON s.assignment_id = a.id
       WHERE s.registration_id = $1
       ORDER BY s.submitted_at DESC`,
      [student.id]
    );
    return NextResponse.json(res.rows || []);
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: 'Sync failure' }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const student = await verifyStudent(true);
    const { assignment_id, title, description, repo_url, demo_url, file_url, submission_type } = await req.json();

    if (!title && !assignment_id) {
       return NextResponse.json({ error: 'Title or Assignment ID is required' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO submissions (registration_id, assignment_id, title, description, repo_url, demo_url, file_url, submission_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        student.id,
        assignment_id || null,
        title || 'Untitled Submission',
        description || '',
        repo_url || '',
        demo_url || '',
        file_url || '',
        submission_type || 'assignment'
      ]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    const status = error.message?.includes('Restricted') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
