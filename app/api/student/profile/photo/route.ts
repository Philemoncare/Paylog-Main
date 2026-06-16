import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyStudent } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const student = await verifyStudent(false);

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Max 2MB allowed.' }, { status: 400 });
    }

    // Convert file to base64 for database storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    await query(
      'UPDATE registrations SET profile_photo_url = $1 WHERE id = $2',
      [base64, student.id]
    );

    return NextResponse.json({ success: true, url: base64 });
  } catch (error: any) {
    console.error('PHOTO UPLOAD ERROR:', error);
    const status = error.message.includes('Unauthorized') || error.message.includes('Access Restricted') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to upload photo' }, { status });
  }
}
