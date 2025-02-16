import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";
import { chromium } from "playwright";

interface EmailOptions {
  attachmentName?: string;
  attachmentPath?: string;
  content: string;
  subject: string;
  to: string;
}

interface SendPageOptions {
  emailSubject?: string;
  emailTo: string;
  pageName: string;
  queryParams?: Record<string, string>;
}

export async function renderPageAndSendEmail({
  emailSubject = "Page Snapshot",
  emailTo,
  pageName,
  queryParams = {},
}: SendPageOptions) {
  let browser;
  let tempFilePath;

  try {
    // Launch browser
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Build URL with query parameters
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `/${pageName}${queryString ? `?${queryString}` : ""}`;

    // Navigate to page
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    // Save as MHTML
    const cdpSession = await context.newCDPSession(page);
    const { data } = await cdpSession.send("Page.captureSnapshot", {
      format: "mhtml",
    });

    // Create temp file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    tempFilePath = path.join(tempDir, `${pageName}_${timestamp}.mhtml`);
    fs.writeFileSync(tempFilePath, data);

    // Send email with MHTML content and attachment
    await sendEmail({
      attachmentName: `${pageName}_${timestamp}.mhtml`,
      attachmentPath: tempFilePath,
      content: data, // Send MHTML content directly in email body
      subject: emailSubject,
      to: emailTo,
    });

    return { success: true };
  } catch (error) {
    console.error("Error rendering page and sending email:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false,
    };
  } finally {
    // Cleanup
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (browser) {
      await browser.close();
    }
  }
}

async function sendEmail({ attachmentName, attachmentPath, content, subject, to }: EmailOptions) {
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