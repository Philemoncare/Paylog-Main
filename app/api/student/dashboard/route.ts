import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyStudent } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * PRODUCTION STUDENT DASHBOARD NODE
 * High-performance data aggregation with multi-layered fault protection.
 */
export async function GET() {
  try {
    // Stage 1: Identity Verification
    // We attempt to verify the student node. This is the only mandatory node.
    let student;
    try {
      student = await verifyStudent(false);
    } catch (authError: any) {
      console.error('[DASHBOARD_AUTH_FAULT]:', authError.message);
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    const regId = student.id;

    // Stage 2: Data Aggregation
    // We initialize the response payload with safe defaults.
    const payload: any = {
      isApproved: student.status === 'approved',
      student: {
        id: regId,
        fullName: student.full_name,
        email: student.email,
        status: student.status,
        profile_photo_url: student.profile_photo_url,
      },
      paymentStatus: 'pending',
      schedule: [],
      progress: { percentage: 0, completedModules: 0, totalModules: 0, currentModule: 'Curriculum Active' },
      notifications: []
    };

    // Parallel execution of secondary data nodes.
    // Individual catches ensure one failed node doesn't crash the entire dashboard.
    await Promise.all([
      // A. Financial Ledger Check
      query("SELECT payment_status FROM payments WHERE registration_id = $1 ORDER BY created_at DESC LIMIT 1", [regId])
        .then(res => payload.paymentStatus = res.rows[0]?.payment_status || 'pending')
        .catch(() => console.warn("Financial node sync failed.")),

      // B. Curriculum Schedule Fetch
      query("SELECT * FROM timetable ORDER BY id ASC")
        .then(res => payload.schedule = res.rows || [])
        .catch(() => console.warn("Schedule node sync failed.")),

      // C. Academic Progress Synchronization
      query(`
        SELECT
          (SELECT COUNT(*) FROM student_progress WHERE registration_id = $1) as completed,
          (SELECT COUNT(*) FROM lessons WHERE is_published = TRUE) as total,
          (
            SELECT m.title FROM student_progress sp
            JOIN lessons l ON sp.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            WHERE sp.registration_id = $1 ORDER BY sp.completed_at DESC LIMIT 1
          ) as current
      `, [regId])
        .then(res => {
          const row = res.rows[0];
          const total = parseInt(row.total || '0');
          const completed = parseInt(row.completed || '0');
          payload.progress = {
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            completedModules: completed,
            totalModules: total,
            currentModule: row.current || 'Technical Foundation'
          };
        })
        .catch(() => console.warn("Progress node sync failed.")),

      // D. Signal Alerts Fetch
      query("SELECT * FROM student_notifications WHERE registration_id = $1 ORDER BY created_at DESC LIMIT 5", [regId])
        .then(res => payload.notifications = res.rows || [])
        .catch(() => console.warn("Notification node sync failed."))
    ]);

    return NextResponse.json(payload);

  } catch (error: any) {
    console.error('[CRITICAL_NODE_FAILURE]:', error.message);

    // Check if the failure is infrastructure related (missing tables)
    const isInfra = error.message?.includes('INFRASTRUCTURE') || error.message?.includes('relation');

    return NextResponse.json({
      error: isInfra ? 'SYNC_REQUIRED' : 'CONNECTION_FAULT',
      message: error.message
    }, { status: 500 });
  }
}
