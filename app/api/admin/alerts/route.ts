import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await verifyAdmin();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // 'read', 'unread', 'archived', 'all'
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params: any[] = [];

    if (type && type !== 'all') {
      params.push(type);
      sql += ` AND type = $${params.length}`;
    }

    if (category && category !== 'all' && category !== 'undefined') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (status === 'unread') {
      sql += ' AND is_read = FALSE AND is_archived = FALSE';
    } else if (status === 'read') {
      sql += ' AND is_read = TRUE AND is_archived = FALSE';
    } else if (status === 'archived') {
      sql += ' AND is_archived = TRUE';
    } else {
      // Default to non-archived for 'all' unless specifically requested
      sql += ' AND is_archived = FALSE';
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (title ILIKE $${params.length} OR message ILIKE $${params.length})`;
    }

    // Get total count for pagination
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*)');
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].count);

    sql += ' ORDER BY created_at DESC';

    params.push(limit);
    sql += ` LIMIT $${params.length}`;

    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const res = await query(sql, params);

    // Seed initial alerts if empty
    if (total === 0 && page === 1 && !search) {
      await query(`
        INSERT INTO alerts (type, title, message, category, source)
        VALUES
        ('info', 'System Operational', 'The CodeStart infrastructure is now online and monitoring for traffic.', 'system', 'system'),
        ('success', 'Database Initialized', 'LMS and alert nodes have been synchronized with the main database.', 'system', 'system')
      `);
      // Re-fetch
      const res2 = await query(sql, params);
      return NextResponse.json({
        alerts: res2.rows,
        pagination: { total: 2, page: 1, limit, totalPages: 1 }
      });
    }

    return NextResponse.json({
      alerts: res.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('[FETCH ALERTS ERROR]:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { action, ids, data } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    let sql = '';
    let params: any[] = [];

    switch (action) {
      case 'mark_read':
        sql = 'UPDATE alerts SET is_read = TRUE WHERE id = ANY($1)';
        params = [ids];
        break;
      case 'mark_unread':
        sql = 'UPDATE alerts SET is_read = FALSE WHERE id = ANY($1)';
        params = [ids];
        break;
      case 'archive':
        sql = 'UPDATE alerts SET is_archived = TRUE WHERE id = ANY($1)';
        params = [ids];
        break;
      case 'restore':
        sql = 'UPDATE alerts SET is_archived = FALSE WHERE id = ANY($1)';
        params = [ids];
        break;
      case 'mark_all_read':
        sql = 'UPDATE alerts SET is_read = TRUE WHERE is_read = FALSE AND is_archived = FALSE';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await query(sql, params);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[UPDATE ALERTS ERROR]:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await verifyAdmin();
    const { action, ids } = await req.json();

    if (action === 'delete_selected' && ids && Array.isArray(ids)) {
      await query('DELETE FROM alerts WHERE id = ANY($1)', [ids]);
      return NextResponse.json({ success: true });
    }

    if (action === 'clear_all') {
      await query('DELETE FROM alerts WHERE is_archived = FALSE');
      return NextResponse.json({ success: true });
    }

    if (action === 'clear_archived') {
      await query('DELETE FROM alerts WHERE is_archived = TRUE');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('[DELETE ALERTS ERROR]:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
