import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await verifyAdmin();

    try {
      const res = await query(
        `SELECT
          id,
          student_name,
          phone_number as recipient,
          message_body as message,
          'sms' as type,
          status,
          provider_response,
          created_at
         FROM sms_logs
         ORDER BY created_at DESC
         LIMIT 100`
      );
      return NextResponse.json(res.rows || []);
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('[FETCH SMS LOGS ERROR]:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}
