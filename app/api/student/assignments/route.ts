import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyStudent } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * STUDENT ASSIGNMENT NODE
 * Delivers cohort challenges with verification checks.
 */
export async function GET() {
  try {
    const student = await verifyStudent(false);

    if (student.status !== 'approved') {
       return NextResponse.json({ restricted: true, assignments: [] });
    }

    const res = await query(`
      SELECT a.*, l.title as lesson_title, m.title as module_title
      FROM assignments a
      JOIN lessons l ON a.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      WHERE l.is_published = TRUE
      ORDER BY a.created_at DESC
    `);

    return NextResponse.json(res.rows || []);
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: 'Comms failure' }, { status });
  }
}
