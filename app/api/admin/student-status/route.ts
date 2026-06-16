import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { createAlert } from '@/lib/alerts';
import { sendApprovalEmail } from '@/lib/mail';

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const res = await query(
      `UPDATE registrations SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Identity not found' }, { status: 404 });
    }

    const student = res.rows[0];

    // If status is approved, trigger automation
    if (status === 'approved') {
      // 1. Sync any pending payments to approved
      await query(
        "UPDATE payments SET payment_status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE registration_id = $1 AND payment_status != 'approved'",
        [id]
      );

      // 2. Transmit Onboarding Dispatch (Email)
      try {
        const emailRes = await sendApprovalEmail(student.email, student.full_name);
        if (emailRes.success) {
           await query(
             'UPDATE registrations SET approval_email_sent = TRUE, approval_email_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
             [id]
           );
        }
      } catch (e) {
        console.error("[AUTOMATION] Dispatch failure:", e);
      }

      await createAlert('success', `Student Node Authorized: ${student.full_name}`, 'admin');
    }

    if (status === 'rejected') {
       await createAlert('warning', `Student Node Decommissioned: ${student.full_name}`, 'admin');
    }

    return NextResponse.json(student);
  } catch (error: any) {
    console.error('[STATUS_SYNC_FAULT]:', error.message);
    return NextResponse.json({ error: 'Operational failure' }, { status: 500 });
  }
}
