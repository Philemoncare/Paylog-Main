import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

    try {
      const res = await query('SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index ASC', [courseId]);
      return NextResponse.json(res.rows || []);
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('[FETCH MODULES ERROR]:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const { course_id, title, description, order_index, is_published } = await req.json();

    if (!course_id || !title) return NextResponse.json({ error: 'Course ID and title required' }, { status: 400 });

    const res = await query(
      'INSERT INTO modules (course_id, title, description, order_index, is_published) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [course_id, title, description || '', order_index || 1, is_published !== false]
    );
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { id, title, description, order_index, is_published } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const res = await query(
      'UPDATE modules SET title = $1, description = $2, order_index = $3, is_published = $4 WHERE id = $5 RETURNING *',
      [title, description, order_index, is_published, id]
    );

    if (res.rowCount === 0) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

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

    await query('DELETE FROM modules WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
