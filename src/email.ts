import nodemailer from 'nodemailer';
import fs from 'fs'; // Use the Node.js fs module to read HTML files
import path from 'path'; 
import { fileURLToPath } from 'url';



// Define an async function to send emails
async function sendEmail(to, subject, username) {
  "use server";
  const transporter = nodemailer.createTransport({
    host: 'mail.easyformforge.com',  // Your SMTP server
    port: 587,  // Typically, 587 for TLS or 465 for SSL
    auth: {
      user: 'admin@easyformforge.com',  // SMTP username
      pass: 'bMN8BxEq*01vK%cm'  // SMTP password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  const __filename = fileURLToPath(import.meta.url);

  const __dirname = path.dirname(__filename);
  const htmlTemplatePath = path.resolve(__dirname,'./emailTemplate.html');
  let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');

  // Replace placeholders in the HTML template with actual values
  htmlContent = htmlContent.replace(/{{username}}/g, to);
  htmlContent = htmlContent.replace(/{{date}}/g, new Date().toLocaleDateString());
  htmlContent = htmlContent.replace(/{{otp}}/g, '251520');
  const mailOptions = {
    from: 'admin@easyformforge.com',  // Email must be authorized by SMTP server
    to: to,  // Recipient's email address
    subject: 'OTP Verification',  // Email subject
    html: htmlContent
  };

  try {
    // Send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;  // Optionally return the info object
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;  // Rethrow or handle error as needed
  }
}

export default sendEmail;