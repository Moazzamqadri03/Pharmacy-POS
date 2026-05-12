import nodemailer from 'nodemailer';

let transporter: any = null;

async function getTransporter() {
  if (!transporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendOtpEmail(email: string, code: string, name?: string) {
  const transporter = await getTransporter();
  if (!transporter) {
    console.warn('Email not configured. OTP:', code);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Your Peerzada Medicate Verification Code: ${code}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
              h1 { color: #00c896; font-size: 24px; margin-bottom: 20px; }
              .code { font-size: 32px; font-weight: bold; color: #0e1929; background: #f0f0f0; padding: 16px; border-radius: 8px; text-align: center; letter-spacing: 4px; margin: 24px 0; font-family: monospace; }
              .footer { color: #666; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔐 Verification Code</h1>
              <p>Hello${name ? ', ' + name : ''},</p>
              <p>Your one-time verification code for Peerzada Medicate is:</p>
              <div class="code">${code}</div>
              <p>This code expires in 5 minutes.</p>
              <p>If you did not request this code, you can safely ignore this email.</p>
              <div class="footer">
                <p>© 2026 Peerzada Medicate Duroo. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

export async function sendOtpSms(phone: string, code: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('SMS (Twilio) not configured. OTP:', code);
    return false;
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const message = `Your Peerzada Medicate verification code is: ${code}. Valid for 5 minutes.`;
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to: phone.startsWith('+') ? phone : '+91' + phone,
    });
    
    return true;
  } catch (error) {
    console.error('SMS send failed:', error);
    return false;
  }
}
