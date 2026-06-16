import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function getAdminSession() {
  const sessionToken = cookies().get('admin_session_token')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const res = await query(
      `SELECT a.id, a.username, a.role
       FROM admin_sessions s
       JOIN admins a ON s.admin_id = a.id
       WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
      [sessionToken]
    );

    if (!res || (res.rowCount ?? 0) === 0) {
      return null;
    }

    return res.rows[0];
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function verifyAdmin() {
  const admin = await getAdminSession();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return admin;
}

export async function getStudentSession() {
  const studentEmail = cookies().get('student_email')?.value;
  if (!studentEmail) return null;

  try {
    const res = await query(
      'SELECT id, email, full_name, status FROM registrations WHERE email = $1',
      [studentEmail]
    );
    if (!res || res.rowCount === 0) return null;
    return res.rows[0];
  } catch (error) {
    return null;
  }
}

export async function verifyStudent(requireApproved = true) {
  const student = await getStudentSession();
  if (!student) {
    throw new Error('Unauthorized: Student access required');
  }
  if (requireApproved && student.status !== 'approved') {
    throw new Error('Access Restricted: Your account is awaiting verification.');
  }
  return student;
}
