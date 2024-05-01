import nodemailer from 'nodemailer';

// Configure the transporter with your SMTP server details




// Define an async function to send emails
async function sendEmail(to, subject, text) {
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
    const mailOptions = {
        from: 'admin@easyformforge.com',  // Email must be authorized by SMTP server
        to: to,  // Recipient's email address
        subject: subject,  // Email subject
        text: text  // Plain text body
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