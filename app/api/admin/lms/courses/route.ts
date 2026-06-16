import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await verifyAdmin();
    try {
      const res = await query('SELECT * FROM courses ORDER BY created_at DESC');
      return NextResponse.json(res.rows || []);
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('[FETCH COURSES ERROR]:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const { title, description, thumbnail_url, is_published } = await req.json();

    if (!title) return NextResponse.json({ error: 'Course title is required' }, { status: 400 });

    const res = await query(
      'INSERT INTO courses (title, description, thumbnail_url, is_published) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description || '', thumbnail_url || '', is_published !== false]
    );
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { id, title, description, thumbnail_url, is_published } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const res = await query(
      'UPDATE courses SET title = $1, description = $2, thumbnail_url = $3, is_published = $4 WHERE id = $5 RETURNING *',
      [title, description, thumbnail_url, is_published, id]
    );

    if (res.rowCount === 0) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await query('DELETE FROM courses WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
