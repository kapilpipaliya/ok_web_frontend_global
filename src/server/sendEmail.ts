import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer"; // Use the Node.js fs module to read HTML files

// Define an async function to send emails
export async function sendEmail(to: string, username: any) {
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
  const __filename = fileURLToPath(import.meta.url);

  const __dirname = path.dirname(__filename);
  const htmlTemplatePath = path.resolve(
    __dirname,
    "../../assets/html/emailTemplate.html",
  );
  let htmlContent = fs.readFileSync(htmlTemplatePath, "utf8");

  // Replace placeholders in the HTML template with actual values
  htmlContent = htmlContent.replace(/{{username}}/g, username);
  htmlContent = htmlContent.replace(
    /{{date}}/g,
    new Date().toLocaleDateString(),
  );
  htmlContent = htmlContent.replace(/{{otp}}/g, "251520");
  const mailOptions = {
    from: "admin@easyformforge.com", // Email must be authorized by SMTP server
    html: htmlContent,
    subject: "OTP Verification", // Email subject
    to: to, // Recipient's email address
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
