import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await verifyAdmin();

    // Optimized Joined Query to reduce backend load
    const res = await query(`
      SELECT p.*, r.approval_email_sent, r.approval_email_sent_at, r.full_name as student_name
      FROM payments p
      LEFT JOIN registrations r ON p.registration_id = r.id
      ORDER BY p.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('[PAYMENTS_FAULT]:', error.message);
    return NextResponse.json({ error: 'Internal system failure.' }, { status: 500 });
  }
}
