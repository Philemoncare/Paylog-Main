import nodemailer from 'nodemailer';
import { WHATSAPP_GROUP_LINK, SCHEDULE_DISPLAY } from './constants';

/**
 * Unified Mail Dispatcher
 * Tries Resend first, forces immediate SMTP fallback on any failure.
 */
async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const fromName = "CodeStart Ghana";
  const fromEmail = "favmoms440@gmail.com";
  const fromFull = process.env.MAIL_FROM || `${fromName} <${fromEmail}>`;

  // 1. Try Resend
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_api_key')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        },
        body: JSON.stringify({ from: fromFull, to, subject, html }),
      });

      if (res.ok) return { success: true, provider: 'resend' };
    } catch (err) {
      console.warn(`[MAIL] Resend failed, trying SMTP...`);
    }
  }

  // 2. SMTP Fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const smtpConfig: any = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    };

    if (process.env.SMTP_HOST.includes('gmail.com')) {
      delete smtpConfig.host;
      delete smtpConfig.port;
      smtpConfig.service = 'gmail';
    }

    const transporter = nodemailer.createTransport(smtpConfig);
    try {
      await transporter.sendMail({ from: fromFull, to, subject, html });
      return { success: true, provider: 'smtp' };
    } catch (error: any) {
      console.error(`[MAIL] SMTP ERROR:`, error.message);
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'No mail providers configured' };
}

export async function sendVerificationEmail(to: string, code: string) {
  const subject = 'CodeStart Admin Verification';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px;">
      <h2 style="color: #0f172a; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 24px;">Security Protocol</h2>
      <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Use the verification code below to authorize your administrative session.</p>
      <div style="background-color: #f8fafc; padding: 32px; border-radius: 16px; text-align: center; margin: 32px 0; border: 1px solid #f1f5f9;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: #2563eb; font-family: monospace;">${code}</span>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code will expire in 10 minutes.</p>
    </div>
  `;
  return await sendMail({ to, subject, html });
}

export async function sendApprovalEmail(to: string, name: string) {
  const subject = 'Application Approved: Welcome to CodeStart Ghana 🚀';
  const firstName = name.split(' ')[0];

  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
      <div style="background-color: #0f172a; padding: 48px 40px; text-align: center;">
        <div style="color: #ffffff; font-weight: 900; font-size: 24px; letter-spacing: -0.05em; margin-bottom: 8px;">CODESTART</div>
        <div style="color: #3b82f6; font-size: 12px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase;">Practical Software Engineering</div>
      </div>

      <div style="padding: 48px 40px;">
        <h1 style="color: #0f172a; font-size: 28px; font-weight: 900; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em;">Congratulations, ${firstName}!</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.8; margin-bottom: 32px;">Your application for the 2026 CodeStart Ghana Cohort has been officially <strong>Approved</strong>. You are now part of an elite group of aspiring engineers.</p>

        <div style="background-color: #f8fafc; border-radius: 24px; padding: 32px; margin-bottom: 40px; border: 1px solid #f1f5f9;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 20px;">Onboarding Protocol</h3>

          <div style="margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">Step 1: Join Community</p>
            <a href="${WHATSAPP_GROUP_LINK}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px; shadow: 0 10px 15px -3px rgba(37,99,235,0.4);">Join WhatsApp Group</a>
          </div>

          <div>
             <p style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">Step 2: Access Portal</p>
             <p style="color: #334155; font-size: 14px; margin: 0;">Log in to your student dashboard to access the curriculum and technical labs.</p>
          </div>
        </div>

        <div style="border-left: 4px solid #3b82f6; padding-left: 20px; margin-bottom: 40px;">
           <p style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">Training Commencement</p>
           <p style="color: #64748b; font-size: 14px; margin: 0;">${SCHEDULE_DISPLAY.trainingStart}</p>
        </div>

        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">We are excited to see what you will build. Prepare your environment and stay focused.</p>

        <div style="margin-top: 48px; pt-32px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="color: #0f172a; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">CodeStart Ghana</p>
          <p style="color: #94a3b8; font-size: 11px;">Elite Engineering Academy &bull; Takoradi</p>
        </div>
      </div>
    </div>
  `;

  return await sendMail({ to, subject, html });
}

export async function sendPasswordResetEmail(to: string, name: string, code: string) {
  const subject = 'Reset Your Security Key: CodeStart Ghana';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px;">
      <h2 style="color: #0f172a; font-weight: 900; margin-bottom: 16px;">Keyphrase Reset</h2>
      <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Hi ${name.split(' ')[0]}, use the code below to reset your portal access.</p>
      <div style="background-color: #f8fafc; padding: 32px; border-radius: 16px; text-align: center; margin: 32px 0;">
        <span style="font-size: 40px; font-weight: 900; letter-spacing: 0.2em; color: #2563eb; font-family: monospace;">${code}</span>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">Expires in 15 minutes.</p>
    </div>
  `;
  return await sendMail({ to, subject, html });
}
