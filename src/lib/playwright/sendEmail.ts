import type { Session } from "neo4j-driver";

import juice from "juice";
import nodemailer from "nodemailer";
import { Resend } from "resend";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";

import { useEmail } from "./functions/getEmailService";
import type { Vertex } from "~/lib/graph/type/vertex";
import { queueEmail } from "~/server/queue/emailQueue";

interface EmailOptions {
  attachmentName?: string;
  attachmentPath?: string;
  content: string;
  subDomain: string;
  subject: string;
  to: string;
}

/**
 * Queue an email for asynchronous sending via BullMQ worker
 * This is the main function to use for sending emails
 */
export async function sendEmail(options: EmailOptions) {
  // Process HTML content with juice to inline CSS before queueing
  const processedContent = juice(options.content);

  try {
    const result = await queueEmail({
      to: options.to,
      subject: options.subject,
      content: processedContent,
      subDomain: options.subDomain,
      attachmentName: options.attachmentName,
      attachmentPath: options.attachmentPath,
    });

    console.log(
      `[Email] Email queued for ${options.to} with job ID: ${result.jobId}`,
    );
    return result;
  } catch (error) {
    console.error("[Email] Failed to queue email:", error);
    throw error;
  }
}

/**
 * Send an email directly (used by the BullMQ worker)
 * Do not call this directly - use sendEmail() instead
 */
export async function sendEmailDirect(options: EmailOptions) {
  const { attachmentName, attachmentPath, content, subDomain, subject, to } =
    options;

  // Process HTML content with juice to inline CSS
  const processedContent = juice(content);

  const dbSetting = await getEmailSetting(subDomain);
  let emailInfo;
  try {
    if (dbSetting?.P.active === "resend") {
      // Use official Resend SDK for Resend provider
      const resend = new Resend(dbSetting.P.resendApiKey);

      const { data, error } = await resend.emails.send({
        from: dbSetting.P.fromEmail,
        to: [to],
        subject,
        html: processedContent,
      });

      if (error) {
        console.error("Resend API error:", error);
        throw new Error(
          `Resend API error: ${error.message || JSON.stringify(error)}`,
        );
      }

      emailInfo = { messageId: data?.id };
    } else if (dbSetting?.P.active && dbSetting.P.active !== "smtp") {
      // Use email service provider for other providers (SendGrid, etc.)
      const emailService = useEmail(dbSetting);
      emailInfo = await emailService.send({
        // Not supported yet
        // attachments: attachmentPath && attachmentName ? [{
        //   filename: attachmentName,
        //   path: attachmentPath,
        // }] : undefined,
        from: dbSetting.P.fromEmail || process.env.SMTP_FROM,
        html: processedContent,
        subject,
        to,
      });
    } else {
      // Fall back to SMTP if no active provider
      const transporter = nodemailer.createTransport({
        auth: {
          pass: dbSetting?.P.smtpPassword || process.env.SMTP_PASS,
          user: dbSetting?.P.smtpUsername || process.env.SMTP_USER,
        },
        host: dbSetting?.P.smtpHost || process.env.SMTP_HOST,
        port: dbSetting?.P.smtpPort || Number(process.env.SMTP_PORT),
        secure:
          (dbSetting?.P.secure ?? process.env.SMTP_SECURE)
            ? process.env.SMTP_SECURE === "true"
            : false,
        tls: {
          rejectUnauthorized: false,
        },
        // debug: true,
        // logger: true,
      });

      const emailOptions: nodemailer.SendMailOptions = {
        attachments:
          attachmentPath && attachmentName
            ? [
                {
                  filename: attachmentName,
                  path: attachmentPath,
                },
              ]
            : undefined,
        from: dbSetting?.P.fromEmail || process.env.SMTP_FROM,
        html: processedContent,
        subject,
        to,
      };

      emailInfo = await transporter.sendMail(emailOptions);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    // Continue execution to save to database even if email fails
  }

  await saveEmailToDatabase(subDomain, {
    attachmentName,
    attachmentPath,
    content: processedContent, // Save the processed content
    dbSetting,
    emailInfo,
    subject,
    to,
  });

  return emailInfo;
}

async function getEmailSetting(subDomain: string): Promise<null | Vertex> {
  const driver = await getDriver();
  const dbSession = driver.session({ database: subDomain });

  try {
    const emailSettingVertex = await getEmailSettingVertex(
      subDomain,
      dbSession,
    );
    return emailSettingVertex || getEnvEmailSetting();
  } finally {
    await dbSession.close();
  }
}

async function getEmailSettingVertex(
  subDomain: string,
  dbSession: Session,
): Promise<null | Vertex> {
  if (subDomain === ADMIN_DB_NAME) {
    return await getSystemEmailSetting(subDomain, dbSession);
  }

  return (
    (await getSubdomainEmailSetting(dbSession)) ||
    (await getParentAccountEmailSetting(subDomain))
  );
}

function getEnvEmailSetting(): null | Vertex {
  if (
    !(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
    )
  ) {
    return null;
  }

  return {
    id: "EmailSetting",
    IN: {},
    L: [],
    OUT: {},
    P: {
      active: "smtp",
      fromEmail: process.env.SMTP_FROM,
      secure: process.env.SMTP_SECURE === "true",
      smtpHost: process.env.SMTP_HOST,
      smtpPassword: process.env.SMTP_PASS,
      smtpPort: Number(process.env.SMTP_PORT),
      smtpUsername: process.env.SMTP_USER,
    },
  };
}

async function getParentAccountEmailSetting(
  subDomain: string,
): Promise<null | Vertex> {
  const driver = await getDriver();
  const systemSession = driver.session({ database: ADMIN_DB_NAME });

  try {
    return await getSystemEmailSetting(subDomain, systemSession);
  } finally {
    await systemSession.close();
  }
}

async function getSubdomainEmailSetting(
  dbSession: Session,
): Promise<null | Vertex> {
  const result = await dbSession.run(
    `MATCH (e:EmailSetting)
     WHERE e.active IS NOT NULL AND e.active <> ''
     RETURN e as settings
     LIMIT 1`,
  );

  return result.records.length > 0
    ? convertNodeToJson(result.records[0].get("settings"))
    : null;
}

async function getSystemEmailSetting(
  subDomain: string,
  dbSession: Session,
): Promise<null | Vertex> {
  const result = await dbSession.run(
    `MATCH (s:SubDomain {key: $subDomain})<-[:AccountSubdomain]-(a:Account)
     MATCH (a)-[:AccountEmailSetting]->(e:EmailSetting)
     WHERE e.active IS NOT NULL AND e.active <> ''
     RETURN e as settings
     LIMIT 1`,
    { subDomain },
  );

  return result.records.length > 0
    ? convertNodeToJson(result.records[0].get("settings"))
    : null;
}

async function saveEmailToDatabase(
  subDomain: string,
  {
    attachmentName,
    attachmentPath,
    content,
    dbSetting,
    emailInfo,
    subject,
    to,
  }: {
    attachmentName?: string;
    attachmentPath?: string;
    content: string;
    dbSetting: null | Vertex;
    emailInfo: nodemailer.SentMessageInfo | undefined;
    subject: string;
    to: string;
  },
) {
  const dbSession = (await getDriver()).session({ database: subDomain });
  try {
    await dbSession.run(
      `CREATE (e:Email {
        from: $from,
        to: $to,
        subject: $subject,
        content: $content,
        attachmentName: $attachmentName,
        attachmentPath: $attachmentPath,
        messageId: $messageId,
        sentAt: datetime(),
        status: $status
      })`,
      {
        attachmentName: attachmentName || null,
        attachmentPath: attachmentPath || null,
        content,
        from:
          dbSetting?.P.fromEmail ||
          dbSetting?.P.from ||
          process.env.SMTP_FROM ||
          null,
        messageId:
          emailInfo && "messageId" in emailInfo ? emailInfo.messageId : null,
        status: emailInfo ? "sent" : "failed",
        subject,
        to,
      },
    );
  } finally {
    await dbSession.close();
  }
}
