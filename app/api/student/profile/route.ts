import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyStudent } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const student = await verifyStudent(false);
    const res = await query(
      'SELECT id, full_name, email, whatsapp, school, experience, motivation, status, profile_photo_url, created_at FROM registrations WHERE id = $1',
      [student.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const studentData = res.rows[0];
    return NextResponse.json({
      ...studentData,
      fullName: studentData.full_name,
      profilePhotoUrl: studentData.profile_photo_url
    });
  } catch (error: any) {
    console.error('FETCH PROFILE ERROR:', error);
    const status = error.message.includes('Unauthorized') || error.message.includes('Access Restricted') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}

export async function PATCH(req: Request) {
  const headerList = headers();
  const ip = headerList.get('x-forwarded-for') || 'unknown';
  const ua = headerList.get('user-agent') || 'unknown';

  try {
    const sessionUser = await verifyStudent(false);
    const { full_name, whatsapp, school, current_password, new_password, profile_photo_url } = await req.json();

    const studentRes = await query(
      'SELECT id, password_hash, full_name, whatsapp, school, profile_photo_url FROM registrations WHERE id = $1',
      [sessionUser.id]
    );

    if (studentRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    const student = studentRes.rows[0];

    const finalFullName = (full_name && full_name.trim()) ? full_name.trim() : student.full_name;
    const finalWhatsApp = (whatsapp && whatsapp.trim()) ? whatsapp.trim() : student.whatsapp;
    const finalSchool = (school && school.trim()) ? school.trim() : student.school;
    const finalPhoto = (profile_photo_url && profile_photo_url.trim()) ? profile_photo_url : student.profile_photo_url;

    let passwordHash = student.password_hash;
    let passwordChanged = false;

    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ error: 'Current password is required to set a new one' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(current_password, student.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
      }

      const isSame = await bcrypt.compare(new_password, student.password_hash);
      if (isSame) {
        return NextResponse.json({ error: 'New password cannot be the same as your old password.' }, { status: 400 });
      }

      passwordHash = await bcrypt.hash(new_password, 10);
      passwordChanged = true;
    }

    await query('BEGIN');
    try {
      const res = await query(
        `UPDATE registrations
         SET full_name = $1,
             whatsapp = $2,
             school = $3,
             password_hash = $4,
             profile_photo_url = $5
         WHERE id = $6
         RETURNING id, full_name, email, whatsapp, school, profile_photo_url`,
        [finalFullName, finalWhatsApp, finalSchool, passwordHash, finalPhoto, student.id]
      );

      if (passwordChanged) {
        await query(
          'INSERT INTO activity_logs (registration_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
          [student.id, 'PASSWORD_CHANGE_MANUAL', ip, ua]
        );
      }

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        data: res.rows[0]
      });
    } catch (dbError) {
      await query('ROLLBACK');
      throw dbError;
    }
  } catch (error: any) {
    console.error('PROFILE UPDATE ERROR:', error);
    const status = error.message.includes('Unauthorized') || error.message.includes('Access Restricted') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status });
  }
}
