import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyAdmin, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    const publicKeys = ['cohort_start_date'];
    const studentAccessKeys = ['timetable_image', 'cohort_start_date'];

    const isAdmin = await getAdminSession();
    const studentEmail = cookies().get('student_email')?.value;

    const isPublicAccess = key && publicKeys.includes(key);
    const isStudentAccess = key && studentAccessKeys.includes(key) && studentEmail;

    if (!isPublicAccess && !isStudentAccess && !isAdmin) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (key && !isPublicAccess && !studentAccessKeys.includes(key) && !isAdmin) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (key) {
      const res = await query('SELECT value FROM settings WHERE key = $1', [key]);
      return NextResponse.json({ value: res.rows[0]?.value || null });
    }

    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const res = await query('SELECT * FROM settings');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const { key, value } = await req.json();

    if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 });

    await query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      [key, value]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
