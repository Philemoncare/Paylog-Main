import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  response.cookies.delete('admin_session_token');
  response.cookies.delete('pending_admin_id');
  response.cookies.delete('student_email');
  response.cookies.delete('student_logged_in');
  return response;
}
