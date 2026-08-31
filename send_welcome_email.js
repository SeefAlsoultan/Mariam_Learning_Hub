// ===== RESEND EMAIL DISPATCHER =====
// Sends personalized welcome and sign-in emails to students
const https = require('https');
require('dotenv').config?.();

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SENDER = process.env.RESEND_DEFAULT_FROM || 'Mariam Khaled Platform <onboarding@resend.dev>';

/**
 * Send personalized welcome email
 * @param {string} toEmail - Student recipient email
 * @param {string} studentName - Student's full name
 */
function sendWelcomeEmail(toEmail, studentName) {
  const apiKey = RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured in environment variables.');
    return;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #2e75b6, #1d5a94); padding: 30px; text-align: center; color: white;">
        <img src="https://mariam-khaled-english.pages.dev/public/mariam.png" width="70" height="70" style="border-radius: 50%; border: 3px solid white; display: block; margin: 0 auto 10px;" alt="Mariam Khaled">
        <h1 style="margin: 0; font-size: 22px;">Mariam Khaled</h1>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">English Learning Platform</p>
      </div>
      <div style="padding: 30px; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Welcome, ${studentName || 'Student'}! 🎓</h2>
        <p style="font-size: 14px; line-height: 1.6;">
          Your account has been successfully created on Instructor <strong>Mariam Khaled's</strong> English Platform.
        </p>
        <p style="font-size: 14px; line-height: 1.6;">
          You can now start practicing <strong>Beginner 2 Level</strong> questions covering Grammar rules, Vocabulary, and Article exercises from Units 7A through 9B.
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://mariam-khaled-english.pages.dev" style="background: #2e75b6; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            Access Your Courses →
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          © 2026 Mariam Khaled English Platform • mariam-khaled-english.pages.dev
        </p>
      </div>
    </div>`;

  const payload = JSON.stringify({
    from: SENDER,
    to: [toEmail],
    subject: `Welcome to Mariam Khaled English Platform, ${studentName}!`,
    html: html
  });

  const req = https.request({
    hostname: 'api.resend.com',
    path: '/emails',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log(`Resend response status (${res.statusCode}):`, body);
    });
  });

  req.on('error', (e) => console.error('Error sending email:', e));
  req.write(payload);
  req.end();
}

module.exports = { sendWelcomeEmail };
