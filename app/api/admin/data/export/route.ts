import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await verifyAdmin();

    // 1. Fetch ALL relevant data for a full system snapshot
    const [
      registrations,
      payments,
      courses,
      modules,
      lessons,
      assignments,
      submissions,
      timetable,
      alerts,
      settings
    ] = await Promise.all([
      query('SELECT * FROM registrations ORDER BY id ASC'),
      query('SELECT * FROM payments ORDER BY id ASC'),
      query('SELECT * FROM courses ORDER BY id ASC'),
      query('SELECT * FROM modules ORDER BY id ASC'),
      query('SELECT * FROM lessons ORDER BY id ASC'),
      query('SELECT * FROM assignments ORDER BY id ASC'),
      query('SELECT * FROM submissions ORDER BY id ASC'),
      query('SELECT * FROM timetable ORDER BY id ASC'),
      query('SELECT * FROM alerts ORDER BY id ASC'),
      query('SELECT * FROM settings')
    ]);

    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "2.0",
        platform: "CodeStart Ghana"
      },
      data: {
        registrations: registrations.rows,
        payments: payments.rows,
        courses: courses.rows,
        modules: modules.rows,
        lessons: lessons.rows,
        assignments: assignments.rows,
        submissions: submissions.rows,
        timetable: timetable.rows,
        alerts: alerts.rows,
        settings: settings.rows
      }
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="codestart_full_backup_${new Date().getTime()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('FULL EXPORT ERROR:', error);
    return NextResponse.json({ error: 'Failed to generate system backup', details: error.message }, { status: 500 });
  }
}
