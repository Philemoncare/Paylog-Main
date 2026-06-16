import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { REGISTRATION_FEE_GHS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

/**
 * PRODUCTION ANALYTICS ENGINE
 */

export async function GET() {
  try {
    await verifyAdmin();

    const data: any = {
      registrations: [],
      revenue: 0,
      submissions: [],
      total_progress: 0
    };

    // Parallel Fetch with individual catch blocks for resilience
    await Promise.all([
      query("SELECT status, COUNT(*) FROM registrations GROUP BY status")
        .then(res => data.registrations = res.rows)
        .catch(() => {}),

      query("SELECT SUM(COALESCE(amount, $1)) as revenue FROM payments WHERE payment_status = 'approved'", [REGISTRATION_FEE_GHS])
        .then(res => data.revenue = parseInt(res.rows[0]?.revenue || '0'))
        .catch(() => {}),

      query("SELECT status, COUNT(*) FROM submissions GROUP BY status")
        .then(res => data.submissions = res.rows)
        .catch(() => {}),

      query("SELECT COUNT(*) as total_completed FROM student_progress")
        .then(res => data.total_progress = parseInt(res.rows[0]?.total_completed || '0'))
        .catch(() => {})
    ]);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[ANALYTICS_ERROR]:', error.message);
    return NextResponse.json({
      registrations: [],
      revenue: 0,
      submissions: [],
      total_progress: 0,
      error: error.message
    }, { status: 200 });
  }
}
