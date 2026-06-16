import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { REGISTRATION_FEE_GHS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await verifyAdmin();

    const stats = {
      totalApplications: 0,
      pendingPayments: 0,
      approvedStudents: 0,
      totalRevenue: 0,
      activeLearners: 0,
      avgCompletion: 0,
      projectCount: 0
    };

    let payments: any[] = [];

    // 1. Fetch Registrations Stats
    try {
      const regRes = await query("SELECT COUNT(*) FROM registrations WHERE status != 'rejected'");
      stats.totalApplications = parseInt(regRes.rows[0].count || '0');

      const approvedRes = await query("SELECT COUNT(*) FROM registrations WHERE status = 'approved'");
      stats.approvedStudents = parseInt(approvedRes.rows[0].count || '0');
    } catch (e) {
      console.warn("[API] Registrations table fetch failed.");
    }

    // 2. Fetch Payments Stats
    try {
      const pendingPayRes = await query("SELECT COUNT(*) FROM payments WHERE payment_status = 'pending'");
      stats.pendingPayments = parseInt(pendingPayRes.rows[0].count || '0');

      const revRes = await query("SELECT SUM(COALESCE(amount, $1)) as total FROM payments WHERE payment_status = 'approved'", [REGISTRATION_FEE_GHS]);
      stats.totalRevenue = parseInt(revRes.rows[0].total || '0');
    } catch (e) {
      console.warn("[API] Payments table fetch failed.");
    }

    // 3. Fetch Recent Activity
    try {
      const activityRes = await query(`
        SELECT r.id as registration_id, r.full_name as student_name, r.created_at as signup_date,
               p.transaction_id, p.payment_status, p.screenshot_url, p.id as payment_id
        FROM registrations r
        LEFT JOIN (
          SELECT DISTINCT ON (registration_id) * FROM payments ORDER BY registration_id, created_at DESC
        ) p ON p.registration_id = r.id
        WHERE r.status != 'rejected'
        ORDER BY r.created_at DESC LIMIT 10
      `);
      payments = activityRes.rows || [];
    } catch (e) {
      console.warn("[API] Recent activity fetch failed.");
    }

    return NextResponse.json({
      stats,
      payments
    });

  } catch (error: any) {
    console.error('[ADMIN_DATA_ERROR]:', error.message);
    // Even on critical error, return a valid structure so dashboard doesn't crash
    return NextResponse.json({
      stats: { totalApplications: 0, pendingPayments: 0, approvedStudents: 0, totalRevenue: 0, activeLearners: 0, avgCompletion: 0, projectCount: 0 },
      payments: [],
      error: error.message
    }, { status: 200 });
  }
}
