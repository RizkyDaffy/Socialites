import nodemailer from 'nodemailer';

/* ===============================
   SECURITY: ENV VALIDATION
================================ */
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error('SMTP credentials are required');
}

/* ===============================
   TRANSPORTER (LOGIC SAMA)
================================ */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // App Password
  },
});

/* ===============================
   OTP GENERATOR
================================ */
export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/* ===============================
   SEND OTP EMAIL
================================ */
export function sendOTPEmail(
  toEmail: string,
  otpCode: string
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!toEmail || !otpCode) {
      console.error('Invalid OTP email payload');
      return resolve(false);
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: 'Your Verification Code',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; background:#f5f5f7; padding:24px">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:32px">
    <h2 style="text-align:center;margin-bottom:8px">FourtyFour</h2>
    <p style="text-align:center;color:#666">Email Verification</p>

    <p>Halo 👋</p>
    <p>Gunakan kode OTP berikut untuk memverifikasi akun Anda:</p>

    <div style="
      text-align:center;
      font-size:36px;
      letter-spacing:8px;
      font-weight:bold;
      color:#28a745;
      margin:24px 0;
      font-family:monospace;
    ">
      ${otpCode}
    </div>

    <p style="font-size:14px;color:#666">
      Kode ini berlaku selama <b>3 menit</b>.
    </p>

    <hr style="margin:24px 0">

    <p style="font-size:12px;color:#999">
      Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.
    </p>

    <p style="text-align:center;font-size:12px;color:#aaa;margin-top:24px">
      PT. EsempehBerkarya.corp<br/>
      connect with people everywhere, everytime
    </p>
  </div>
</div>
`,
    };

    // === SEND MAIL (CALLBACK STYLE – TETAP SAMA) ===
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP email:', error);
        return resolve(false);
      }

      console.log('OTP email sent:', info.response);
      resolve(true);
    });
  });
}
