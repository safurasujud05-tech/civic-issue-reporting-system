const nodemailer = require('nodemailer');

const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@civicai.local';

let transporter;
if (emailHost && emailPort && emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

async function sendStatusNotification(complaint) {
  if (!complaint || !complaint.reporter_email) {
    return;
  }

  const subject = `Update on your civic complaint: ${complaint.title}`;
  const text = `Hello ${complaint.reporter_name || 'Citizen'},\n\n` +
    `Your complaint titled "${complaint.title}" is now marked as "${complaint.status}".\n` +
    `Department: ${complaint.department}\n` +
    `Location: ${complaint.location_name || 'Not specified'}\n\n` +
    `You can track the latest status from the dashboard or reach out to local authorities if you need more support.\n\n` +
    `Thank you for reporting the issue and helping improve civic services.`;

  if (!transporter) {
    console.log('Email notification mock:', {
      to: complaint.reporter_email,
      subject,
      text,
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: emailFrom,
      to: complaint.reporter_email,
      subject,
      text,
    });
    console.log(`Status email sent to ${complaint.reporter_email}`);
  } catch (error) {
    console.error('Failed to send status email:', error.message);
  }
}

module.exports = { sendStatusNotification };
