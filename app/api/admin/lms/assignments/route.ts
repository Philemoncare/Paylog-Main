import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 });

    try {
      const res = await query('SELECT * FROM assignments WHERE lesson_id = $1 ORDER BY created_at DESC', [lessonId]);
      return NextResponse.json(res.rows || []);
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('[FETCH ASSIGNMENTS ERROR]:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const { lesson_id, title, description, due_date, max_score, resources_json } = await req.json();

    if (!lesson_id || !title) return NextResponse.json({ error: 'Lesson ID and title required' }, { status: 400 });

    const res = await query(
      `INSERT INTO assignments (lesson_id, title, description, due_date, max_score)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [lesson_id, title, description || '', due_date || null, max_score || 100]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { id, title, description, due_date, max_score, resources_json } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const res = await query(
      `UPDATE assignments
       SET title = $1, description = $2, due_date = $3, max_score = $4
       WHERE id = $5 RETURNING *`,
      [title, description, due_date, max_score, id]
    );

    if (res.rowCount === 0) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

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

    await query('DELETE FROM assignments WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
