import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData, type UserData } from "~/lib/auth/userDataEncoder";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import type { Vertex } from "~/lib/graph/graph";

// Usage: npm run send-test-email -- <subdomain> <from_email> <to_email>
// Example: npm run send-test-email -- decodeui.io admin@decodeui.io test@test.com

// Mock request object for getting the DB session
const mockRequest = new Request("https://example.com");

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
    
    // Create mock user data with required fields
    const userData: UserData = {
      email: toEmail,
      uuid: "test-user-uuid",
    };
    
    // Create mock user vertex
    const mockUser: Vertex<UserData> = {
      id: "test-user-id",
      L: [], // Labels
      IN: {}, // Incoming relationships
      OUT: {}, // Outgoing relationships
      P: userData
    };
    
    // Generate secure token
    const secureToken = await generateSecureToken(encodeUserData(userData), dbSession);
    
    // Send email
    await sendNotificationEmail(
      EMAIL_TEMPLATES.TestEmail,
      {
        param1: "Test Parameter 1",
        param2: "Test Parameter 2",
      },
      "Command Line Test Email",
      mockUser,
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

sendTestEmail().catch(console.error); 