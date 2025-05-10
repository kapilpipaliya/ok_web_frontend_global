import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData, type UserData } from "~/lib/auth/userDataEncoder";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import type { Vertex } from "~/lib/graph/graph";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { superUserData } from "~/cypher/mutate/manage/superUserData";
import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";

// Usage: npm run send-test-email -- <subdomain> <from_email> <to_email>
// Example: npm run send-test-email -- decodeui.io admin@decodeui.io test@test.com

// Mock request object for getting the DB session
const mockRequest = new Request("https://admin.decodeui.io");

async function sendTestEmail() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error("Usage: node sendTestEmail.js <subdomain> <from_email> <to_email>");
    process.exit(1);
  }
  
  const [subdomain, fromEmail, toEmail] = args;
  
  // Get database session
  const { dbSession } = await getDBSessionForSubdomain(mockRequest);
  
  try {
    console.log(`Sending test email from ${fromEmail} to ${toEmail} via subdomain ${subdomain}...`);
    
    // Get the superuser instead of creating a mock user
    const user = await findAndUseSuperUser();
    
    if (!user) {
      console.error("Super user not found. Cannot send test email.");
      process.exit(1);
    }
    
    // Create user data from the super user
    const userData: UserData = {
      email: user.P.email,
      uuid: user.P.uuid,
    };
    
    // Generate secure token
    const secureToken = await generateSecureToken(encodeUserData(userData), dbSession);
    
    user.P.email = toEmail;
    // Send email
    await sendNotificationEmail(
      EMAIL_TEMPLATES.TestEmail,
      {
        param1: "Test Parameter 1",
        param2: "Test Parameter 2",
      },
      "Command Line Test Email",
      user,
      subdomain,
      secureToken,
    );
    
    console.log("Test email sent successfully!");
  } catch (error) {
    console.error("Error sending test email:", error);
    process.exit(1);
  } finally {
    await dbSession.close();
  }
}

async function findAndUseSuperUser(): Promise<null | Vertex> {
  const superDbSession = (await getDriver()).session({
    database: SYSTEM_DB_NAME,
  });
  
  try {
    // Find user by email
    const query = `
      MATCH (u:User)
      WHERE u.email = $email OR u.username = $username
      RETURN u
    `;
    
    const result = await superDbSession.run(query, { 
      email: superUserData.email,
      username: superUserData.username
    });
    
    if (result.records.length === 0) {
      return null;
    }
    
    // Convert the user node to a Vertex object
    return convertNodeToJson(result.records[0].get("u"));
  } catch (error) {
    console.error("Error finding super user:", error);
    return null;
  } finally {
    await superDbSession.close();
  }
}

sendTestEmail().catch(console.error); 