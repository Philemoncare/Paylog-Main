import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

/**
 * PRODUCTION FILE UPLOAD HANDLER
 * Uses Base64 for immediate database-backed storage compatibility on serverless (Vercel).
 * Standardized for future S3/Cloudinary integration.
 */
export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Enforce 10MB limit for general uploads (PDFs, ZIPs)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Return the Base64 string as the URL.
    // In a scaled production environment, this would upload to S3/Cloudinary and return a CDN URL.
    return NextResponse.json({
      success: true,
      url: base64,
      name: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error: any) {
    console.error('UPLOAD_ERROR:', error);
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: 'File synchronization failed.' }, { status });
  }
}
