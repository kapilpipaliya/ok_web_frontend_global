import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

interface EmailTemplate {
  customHtml?: string;
  otp?: string;
  subject: string;
  username?: string;
}

export async function sendEmail(to: string, template: EmailTemplate) {
  "use server";
  const transporter = nodemailer.createTransport({
    auth: {
      pass: "bMN8BxEq*01vK%cm", // SMTP password
      user: "admin@easyformforge.com", // SMTP username
    },
    host: "mail.easyformforge.com", // Your SMTP server
    port: 587, // Typically, 587 for TLS or 465 for SSL
    tls: {
      rejectUnauthorized: false,
    },
  });

  let htmlContent: string;
  
  if (template.customHtml) {
    htmlContent = template.customHtml;
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const htmlTemplatePath = path.resolve(
      __dirname,
      "../../assets/html/emailTemplate.html"
    );
    htmlContent = fs.readFileSync(htmlTemplatePath, "utf8");

    // Replace placeholders in the HTML template with actual values
    if (template.username) {
      htmlContent = htmlContent.replace(/{{username}}/g, template.username);
    }
    htmlContent = htmlContent.replace(
      /{{date}}/g,
      new Date().toLocaleDateString()
    );
    if (template.otp) {
      htmlContent = htmlContent.replace(/{{otp}}/g, template.otp);
    }
  }

  const mailOptions = {
    from: "admin@easyformforge.com", // Email must be authorized by SMTP server
    html: htmlContent,
    subject: template.subject,
    to: to,
  };

  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
    return info; // Optionally return the info object
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error; // Rethrow or handle error as needed
  }
}
