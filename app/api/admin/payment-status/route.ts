import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendApprovalEmail } from '@/lib/mail';
import { verifyAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function PATCH(req: Request) {
  try {
    const admin = await verifyAdmin();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    // 1. Update the payment record
    const payRes = await query(
      `UPDATE payments SET payment_status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (payRes.rowCount === 0) {
      return NextResponse.json({ error: 'Ledger entry not found' }, { status: 404 });
    }

    const payment = payRes.rows[0];

    // 2. Lifecycle Sync
    if (status === 'approved' && payment.registration_id) {
      await query('UPDATE payments SET approved_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

      // Update registration to approved
      const regUpdate = await query(
        'UPDATE registrations SET status = $1 WHERE id = $2 RETURNING *',
        ['approved', payment.registration_id]
      );

      if (regUpdate.rowCount > 0) {
        const student = regUpdate.rows[0];
        // SEND AUTOMATED DISPATCH
        try {
          const emailResult = await sendApprovalEmail(student.email, student.full_name);
          if (emailResult.success) {
            await query(
              'UPDATE registrations SET approval_email_sent = TRUE, approval_email_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
              [payment.registration_id]
            );
          }
        } catch (e) {
          console.warn("[PAYMENT_AUTO] Dispatch node silent.");
        }
      }
    }

    await logActivity({
      adminId: admin.id,
      registrationId: payment.registration_id,
      action: `${status.toUpperCase()} payment for student node ${payment.registration_id}`
    });

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('[LEDGER_FAULT]:', error.message);
    return NextResponse.json({ error: 'System failure' }, { status: 500 });
  }
}
