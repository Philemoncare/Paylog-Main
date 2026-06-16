import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const payload = await req.json();

    // Support both 1.0 (legacy) and 2.0 (full system) backup formats
    const isFullBackup = payload.metadata && payload.metadata.version === "2.0";
    const registrations = isFullBackup ? payload.data.registrations : payload.registrations;
    const payments = isFullBackup ? payload.data.payments : payload.payments;

    if (!Array.isArray(registrations)) {
      return NextResponse.json({ error: 'Invalid data format: registrations array missing' }, { status: 400 });
    }

    console.log(`[IMPORT] Initiating restoration sequence...`);

    // 1. Transactional wipe of core tables to prevent foreign key orphans during restore
    await query('BEGIN');
    try {
      await query('TRUNCATE TABLE student_progress, student_projects, submissions, assignments, lessons, modules, courses, payments, registrations CASCADE');

      // 2. Import Registrations
      for (const reg of registrations) {
        await query(
          `INSERT INTO registrations (id, full_name, email, whatsapp, age, school, experience, motivation, status, profile_photo_url, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [reg.id, reg.full_name, reg.email, reg.whatsapp, reg.age, reg.school, reg.experience, reg.motivation, reg.status, reg.profile_photo_url, reg.created_at]
        );
      }

      // 3. Import Payments
      if (Array.isArray(payments)) {
        for (const pay of payments) {
          await query(
            `INSERT INTO payments (id, registration_id, student_name, transaction_id, sender_number, payment_status, screenshot_url, amount, approved_at, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [pay.id, pay.registration_id, pay.student_name, pay.transaction_id, pay.sender_number, pay.payment_status, pay.screenshot_url, pay.amount || 450, pay.approved_at, pay.created_at]
          );
        }
      }

      // 4. Import LMS (Only if v2.0 backup)
      if (isFullBackup) {
        const { courses, modules, lessons, assignments, submissions } = payload.data;

        if (Array.isArray(courses)) {
          for (const c of courses) {
             await query(`INSERT INTO courses (id, title, description, thumbnail_url, is_published, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
             [c.id, c.title, c.description, c.thumbnail_url, c.is_published, c.created_at]);
          }
        }
        if (Array.isArray(modules)) {
          for (const m of modules) {
             await query(`INSERT INTO modules (id, course_id, title, description, order_index, is_published, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
             [m.id, m.course_id, m.title, m.description, m.order_index, m.is_published, m.created_at]);
          }
        }
        if (Array.isArray(lessons)) {
          for (const l of lessons) {
             await query(`INSERT INTO lessons (id, module_id, title, content, video_url, pdf_url, order_index, duration_minutes, is_published, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
             [l.id, l.module_id, l.title, l.content, l.video_url, l.pdf_url, l.order_index, l.duration_minutes, l.is_published, l.created_at]);
          }
        }
        if (Array.isArray(assignments)) {
          for (const a of assignments) {
             await query(`INSERT INTO assignments (id, lesson_id, title, description, due_date, max_score, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
             [a.id, a.lesson_id, a.title, a.description, a.due_date, a.max_score, a.created_at]);
          }
        }
        if (Array.isArray(submissions)) {
          for (const s of submissions) {
             await query(`INSERT INTO submissions (id, registration_id, assignment_id, title, description, repo_url, demo_url, file_url, submission_type, status, score, feedback, reviewed_by, reviewed_at, submitted_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
             [s.id, s.registration_id, s.assignment_id, s.title, s.description, s.repo_url, s.demo_url, s.file_url, s.submission_type, s.status, s.score, s.feedback, s.reviewed_by, s.reviewed_at, s.submitted_at]);
          }
        }
      }

      // 5. Sequence Restoration
      const tables = ['registrations', 'payments', 'courses', 'modules', 'lessons', 'assignments', 'submissions'];
      for (const table of tables) {
        await query(`SELECT setval('${table}_id_seq', (SELECT MAX(id) FROM ${table}))`);
      }

      await query('COMMIT');
      console.log('[IMPORT] System successfully restored to provided snapshot.');
      return NextResponse.json({ success: true, message: 'Platform data has been successfully restored.' });

    } catch (dbError) {
      await query('ROLLBACK');
      throw dbError;
    }
  } catch (error: any) {
    console.error('CRITICAL RESTORE FAULT:', error);
    return NextResponse.json({ error: error.message || 'System restoration failed.' }, { status: 500 });
  }
}
