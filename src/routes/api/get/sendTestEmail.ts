import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { renderPageAsMHtml } from "~/lib/playwright/renderPageAsMHtml";
import { sendEmailWithAttachment } from "~/lib/playwright/sendEmailWithAttachment";
// New function to handle sending a test email

export async function GET({ request }: APIEvent) {
  // const { email } = await request.json(); // Extract email from request body
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    const result = await renderPageAsMHtml({
      neo4jSession: dbSession,
      pageName: "test",
        queryParams: {
          param1: "value1",
          param2: "value2"
        },
        subDomain,
    });
    if (result.success) {
      const fileVertex = result.result![0];
      await sendEmailWithAttachment({
        emailSubject: "Test Email With Attachment",
        emailTo: "kapil.pipaliya@gmail.com",
        fileVertex,
      });
      return new Response("Test email sent successfully" + JSON.stringify(result.result), {
        // headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(`Internal Server Error: ${result.error}`, {
        // headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error: any) {
    return new Response(`Internal Server Error: ${error.message}`, {
      // headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
