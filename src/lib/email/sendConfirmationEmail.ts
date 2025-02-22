import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData } from "~/lib/auth/userDataEncoder";

// import { sendEmail } from "./sendEmail"; // You'll need to implement this

export async function sendConfirmationEmail(
  email: string,
  username: string,
  request: Request,
) {
  const userData = encodeUserData({ email, username });
  const { dbSession } = await getDBSessionForSubdomain(request);
  const token = await generateSecureToken(userData, dbSession);

  const confirmationUrl = new URL("/api/auth/confirm-email", request.url);
  confirmationUrl.searchParams.set("token", token);

  const emailContent = `
    <h1>Welcome to Our Platform!</h1>
    <p>Hi ${username},</p>
    <p>Please confirm your email address by clicking the link below:</p>
    <a href="${confirmationUrl.toString()}">Confirm Email Address</a>
    <p>If you didn't create this account, you can safely ignore this email.</p>
  `;

  await sendEmail({
    html: emailContent,
    subject: "Confirm Your Email Address",
    to: email,
  });
}
