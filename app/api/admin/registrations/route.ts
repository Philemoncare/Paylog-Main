import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await verifyAdmin();

    try {
      // Optimized Query with sub-queries for payment context
      const res = await query(`
        SELECT r.id, r.full_name, r.email, r.whatsapp, r.status, r.created_at, r.age, r.school, r.experience,
               (SELECT p.payment_status FROM payments p WHERE p.registration_id = r.id ORDER BY p.created_at DESC LIMIT 1) as payment_status
        FROM registrations r
        ORDER BY r.created_at DESC
        LIMIT 250
      `);

      return NextResponse.json(res.rows || []);
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('[REGISTRATIONS_FAULT]:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function DELETE(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await query('DELETE FROM registrations WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Deletion failure.' }, { status: 500 });
  }
}
