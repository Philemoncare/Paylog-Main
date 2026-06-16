import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { createAlert } from '@/lib/alerts';
import { REGISTRATION_FEE_GHS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

/**
 * CORE PLATFORM PROVISIONING ENGINE
 * Single source of truth for database architecture.
 * Ensures indexes, constraints, and relations are optimized for production.
 */
export async function GET() {
  try {
    await verifyAdmin();
    console.log('[SYSTEM] Initiating core infrastructure synchronization...');

    // 1. IDENTITY & REGISTRATION
    await query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash TEXT,
        whatsapp VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        age INTEGER,
        school VARCHAR(255),
        experience VARCHAR(255),
        motivation TEXT,
        profile_photo_url TEXT,
        approval_email_sent BOOLEAN DEFAULT FALSE,
        approval_email_sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. FINANCIAL LEDGER
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        student_name TEXT,
        transaction_id TEXT UNIQUE,
        sender_number TEXT,
        screenshot_url TEXT,
        amount INTEGER DEFAULT ${REGISTRATION_FEE_GHS},
        payment_status VARCHAR(20) DEFAULT 'pending',
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. CURRICULUM MANAGEMENT (LMS)
    await query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        video_url TEXT,
        pdf_url TEXT,
        order_index INTEGER NOT NULL,
        duration_minutes INTEGER,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. ACADEMIC EVALUATION (UNIFIED SUBMISSIONS)
    await query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP WITH TIME ZONE,
        max_score INTEGER DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        title VARCHAR(255),
        description TEXT,
        repo_url TEXT,
        demo_url TEXT,
        file_url TEXT,
        submission_type VARCHAR(50) DEFAULT 'assignment', -- 'assignment' or 'project'
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        score INTEGER,
        feedback TEXT,
        reviewed_by INTEGER,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. PROGRESS & ENGAGEMENT
    await query(`
      CREATE TABLE IF NOT EXISTS student_progress (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(registration_id, lesson_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS student_notifications (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. SYSTEM UTILITIES
    await query(`
      CREATE TABLE IF NOT EXISTS timetable (
        id SERIAL PRIMARY KEY,
        day VARCHAR(20) NOT NULL,
        time VARCHAR(100) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) DEFAULT 'info',
        title VARCHAR(255),
        message TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'system',
        source VARCHAR(50) DEFAULT 'system',
        is_read BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. PERFORMANCE ACCELERATION (INDEXES)
    await query('CREATE INDEX IF NOT EXISTS idx_reg_email ON registrations(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_sub_reg ON submissions(registration_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_sub_type ON submissions(submission_type)');
    await query('CREATE INDEX IF NOT EXISTS idx_prog_reg ON student_progress(registration_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_notif_reg ON student_notifications(registration_id)');

    await createAlert('success', 'Platform reconstruction successful: Core node synchronized.', 'system');

    return NextResponse.json({ success: true, message: 'Platform infrastructure reconstructed and synchronized.' });

  } catch (error: any) {
    console.error('[RECONSTRUCTION_FAULT]:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
