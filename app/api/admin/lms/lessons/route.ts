import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) return NextResponse.json({ error: 'Module ID required' }, { status: 400 });

    try {
      const res = await query('SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_index ASC', [moduleId]);
      return NextResponse.json(res.rows || []);
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('[FETCH LESSONS ERROR]:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const { module_id, title, content, video_url, pdf_url, order_index, duration_minutes, is_published } = await req.json();

    if (!module_id || !title) return NextResponse.json({ error: 'Module ID and title required' }, { status: 400 });

    const res = await query(
      'INSERT INTO lessons (module_id, title, content, video_url, pdf_url, order_index, duration_minutes, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [module_id, title, content || '', video_url || '', pdf_url || '', order_index || 1, duration_minutes || 0, is_published !== false]
    );
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { id, title, content, video_url, pdf_url, order_index, duration_minutes, is_published } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const res = await query(
      'UPDATE lessons SET title = $1, content = $2, video_url = $3, pdf_url = $4, order_index = $5, duration_minutes = $6, is_published = $7 WHERE id = $8 RETURNING *',
      [title, content, video_url, pdf_url, order_index, duration_minutes, is_published, id]
    );

    if (res.rowCount === 0) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

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

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await query('DELETE FROM lessons WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
