import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyStudent } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * UNIFIED STUDENT PROJECT API
 */

export async function GET() {
  try {
    const student = await verifyStudent(false);

    if (student.status !== 'approved') return NextResponse.json({ projects: [] });

    // Fetch all submissions of type 'project' for this student
    const res = await query(
      `SELECT * FROM submissions
       WHERE registration_id = $1 AND submission_type = 'project'
       ORDER BY submitted_at DESC`,
      [student.id]
    );

    return NextResponse.json({ projects: res.rows || [] });
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: 'Project sync failure' }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const student = await verifyStudent(true);
    const { title, description, projectUrl, repoUrl, demoUrl } = await req.json();

    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

    const result = await query(
      `INSERT INTO submissions (
        registration_id,
        title,
        description,
        repo_url,
        demo_url,
        submission_type,
        status
      ) VALUES ($1, $2, $3, $4, $5, 'project', 'pending')
      RETURNING *`,
      [student.id, title, description, repoUrl || projectUrl, demoUrl || projectUrl]
    );

    return NextResponse.json({ success: true, project: result.rows[0] });
  } catch (error: any) {
    const status = error.message?.includes('Restricted') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
