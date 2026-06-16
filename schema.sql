-- PostgreSQL Schema for CodeStart Ghana

CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT,
  whatsapp VARCHAR(50) NOT NULL,
  age INTEGER,
  school VARCHAR(255),
  experience VARCHAR(255),
  motivation TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  approval_email_sent BOOLEAN DEFAULT FALSE,
  approval_email_sent_at TIMESTAMP
);

-- Partial unique index to allow email reuse after rejection
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_active_email ON registrations (email) WHERE (status != 'rejected');

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  student_name VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  sender_number VARCHAR(50) NOT NULL,
  screenshot_url TEXT,
  payment_status VARCHAR(50) DEFAULT 'pending',
  registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
  approved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED AUTHORIZED ADMIN (Password should be hashed with bcrypt)
-- INSERT INTO admins (username, password_hash, role) VALUES ('favmoms440@gmail.com', '$2a$10$YourHashedPasswordHere', 'superadmin');

CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timetable (
  id SERIAL PRIMARY KEY,
  day VARCHAR(20) NOT NULL,
  time VARCHAR(100) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  message TEXT NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'system', 'admin', 'student'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(255),
  phone_number VARCHAR(50) NOT NULL,
  message_body TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed'
  provider_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LMS & LEARNING SYSTEM
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_progress (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(registration_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS student_notifications (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INITIAL SEED FOR TIMETABLE
-- INSERT INTO timetable (day, time, topic) VALUES
-- ('Monday', '1:00 PM - 3:00 PM', 'HTML5 & Semantic Web'),
-- ('Wednesday', '1:00 PM - 3:00 PM', 'Modern CSS & Flexbox'),
-- ('Friday', '1:00 PM - 3:00 PM', 'JavaScript Fundamentals');
