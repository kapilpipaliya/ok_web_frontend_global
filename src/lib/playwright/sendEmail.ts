import nodemailer from "nodemailer";

interface EmailOptions {
  attachmentName?: string;
  attachmentPath?: string;
  content: string;
  subject: string;
  to: string;
}

export async function sendEmail({ attachmentName, attachmentPath, content, subject, to }: EmailOptions) {
  const transporter = nodemailer.createTransport({
    auth: {
      pass: process.env.SMTP_PASS,
      user: process.env.SMTP_USER,
    },
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    tls: {
      rejectUnauthorized: false,
    },
  });

  const emailOptions: nodemailer.SendMailOptions = {
    from: process.env.SMTP_FROM,
    html: content, // Using html instead of text to preserve formatting
    subject,
    to,
  };

  if (attachmentPath && attachmentName) {
    emailOptions.attachments = [{
      filename: attachmentName,
      path: attachmentPath,
    }];
  }

  await transporter.sendMail(emailOptions);
} 