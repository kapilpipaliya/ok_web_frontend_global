import nodemailer from "nodemailer";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { getDriver } from "~/cypher/driver";

interface EmailOptions {
  attachmentName?: string;
  attachmentPath?: string;
  content: string;
  subDomain: string;
  subject: string;
  to: string;
}

interface SMTPConfig {
  from: string;
  host: string;
  pass: string;
  port: number;
  secure: boolean;
  user: string;
}

export async function sendEmail({
  attachmentName,
  attachmentPath,
  content,
  subDomain,
  subject,
  to,
}: EmailOptions) {
  const dbSettings = await getEmailSettings(subDomain);

  const transportConfig = {
    auth: {
      pass: dbSettings?.pass || process.env.SMTP_PASS,
      user: dbSettings?.user || process.env.SMTP_USER,
    },
    host: dbSettings?.host || process.env.SMTP_HOST,
    port: dbSettings?.port || Number(process.env.SMTP_PORT),
    secure: dbSettings?.secure ?? process.env.SMTP_SECURE === "true",
    tls: {
      rejectUnauthorized: false,
    },
  };

  const transporter = nodemailer.createTransport(transportConfig);

  const emailOptions: nodemailer.SendMailOptions = {
    from: dbSettings?.from || process.env.SMTP_FROM,
    html: content, // Using html instead of text to preserve formatting
    subject,
    to: "kapilpipaliya@gmail.com",
  };

  if (attachmentPath && attachmentName) {
    emailOptions.attachments = [
      {
        filename: attachmentName,
        path: attachmentPath,
      },
    ];
  }

  await transporter.sendMail(emailOptions);
}

async function getEmailSettings(subDomain: string): Promise<null | SMTPConfig> {
  if (subDomain === SYSTEM_DB_NAME) {
    return null; // Will use env settings
  }

  const dbSession = (await getDriver()).session({ database: subDomain });
  try {
    const result = await dbSession.run(
      `MATCH (s:EmailSetting) 
       RETURN s.smtpHost as host, 
              s.smtpPort as port,
              s.smtpUsername as user,
              s.smtpPassword as pass,
              s.fromEmail as from,
              s.secure as secure
       LIMIT 1`,
    );

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0];
    const settings = {
      from: record.get("from"),
      host: record.get("host"),
      pass: record.get("pass"),
      port: Number.parseInt(record.get("port")),
      secure: record.get("secure") === true,
      user: record.get("user"),
    };

    // Validate that all required fields are present
    if (
      !(
        settings.host &&
        settings.port &&
        settings.user &&
        settings.pass &&
        settings.from
      )
    ) {
      return null;
    }

    return settings;
  } finally {
    await dbSession.close();
  }
}
