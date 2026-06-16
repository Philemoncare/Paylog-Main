import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyStudent } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const student = await verifyStudent(false);

    if (student.status !== 'approved') return NextResponse.json({ notifications: [] });

    const notifications = await query(
      'SELECT * FROM student_notifications WHERE registration_id = $1 ORDER BY created_at DESC',
      [student.id]
    );

    return NextResponse.json({ notifications: notifications.rows || [] });
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: 'Signal failure' }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const student = await verifyStudent(true);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await query('UPDATE student_notifications SET is_read = TRUE WHERE id = $1 AND registration_id = $2', [id, student.id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Update failure' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const student = await verifyStudent(true);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await query('DELETE FROM student_notifications WHERE id = $1 AND registration_id = $2', [id, student.id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Delete failure' }, { status: 500 });
  }
}
