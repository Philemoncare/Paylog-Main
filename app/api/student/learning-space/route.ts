import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyStudent } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * HIGH-PERFORMANCE LEARNING SYNC API
 * Aggregates curriculum, progress, and assignments in a single parallel block.
 */

export async function GET() {
  try {
    // Stage 1: Identification (Allow pending for state checks)
    const student = await verifyStudent(false);
    const studentId = student.id;

    // Stage 2: Access Protocol
    if (student.status !== 'approved') {
       return NextResponse.json({
         curriculum: [],
         isLocked: true,
         reason: 'Verification Pending'
       });
    }

    // Stage 3: Parallel Execution Node
    const [modulesRes, lessonsRes, assignmentsRes, progressRes] = await Promise.all([
      query('SELECT * FROM modules WHERE is_published = TRUE ORDER BY order_index ASC'),
      query('SELECT * FROM lessons WHERE is_published = TRUE ORDER BY module_id, order_index ASC'),
      query('SELECT * FROM assignments ORDER BY created_at ASC'),
      query('SELECT lesson_id FROM student_progress WHERE registration_id = $1', [studentId])
    ]);

    const modules = modulesRes.rows || [];
    const lessons = lessonsRes.rows || [];
    const assignments = assignmentsRes.rows || [];
    const completedLessonIds = new Set(progressRes.rows.map(r => r.lesson_id));

    // Curriculum Hierarchy Reconstruction
    const curriculum = modules.map(m => ({
      ...m,
      lessons: lessons.filter(l => l.module_id === m.id).map(l => ({
        ...l,
        isCompleted: completedLessonIds.has(l.id),
        assignments: assignments.filter(a => a.lesson_id === l.id)
      }))
    }));

    return NextResponse.json({ curriculum, isLocked: false });

  } catch (error: any) {
    console.error('[LEARNING_SYNC_FAULT]:', error.message);

    // Auth failures
    if (error.message?.includes('Unauthorized') || error.message?.includes('access required')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Academic synchronization failure.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // POST requires full approval
    const student = await verifyStudent(true);
    const { lessonId } = await req.json();

    if (!lessonId) return NextResponse.json({ error: 'Lesson identification required' }, { status: 400 });

    // Atomic progress recording
    await query(
      'INSERT INTO student_progress (registration_id, lesson_id) VALUES ($1, $2) ON CONFLICT (registration_id, lesson_id) DO NOTHING',
      [student.id, lessonId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message?.includes('Restricted') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Progress recording failure.' }, { status });
  }
}
