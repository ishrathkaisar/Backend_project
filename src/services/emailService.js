// src/services/emailService.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, html }) {
  const msg = {
    to,
    from: process.env.EMAIL_USER, // must be a verified sender in SendGrid
    subject,
    html,
  };
  await sgMail.send(msg);
}
