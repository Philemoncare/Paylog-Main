import { query } from '@/lib/db';

export async function logActivity({
  adminId,
  registrationId,
  action,
  ipAddress,
  userAgent
}: {
  adminId?: number;
  registrationId?: number;
  action: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await query(
      `INSERT INTO activity_logs (registration_id, admin_id, action, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [registrationId || null, adminId || null, action, ipAddress || null, userAgent || null]
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
