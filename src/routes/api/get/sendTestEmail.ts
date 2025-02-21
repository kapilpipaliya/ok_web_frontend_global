import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData, type UserData } from "~/lib/auth/userDataEncoder";
import { renderPageAsHtml } from "~/lib/playwright/renderPageAsHtml";
import { sendEmail } from "~/lib/playwright/sendEmail";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  // const { email } = await request.json(); // Extract email from request body
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  const user = await getUserFromSession(request);

  // Generate a secure token instead of passing user data directly
  const secureToken = user
    ? await generateSecureToken(encodeUserData(user.P as UserData), dbSession)
    : undefined;

  try {
    const result = await renderPageAsHtml({
      pageName: "test",
      queryParams: {
        param1: "value1",
        param2: "value2",
      },
      secureToken,
      subDomain,
    });

    if (!result.success) {
      throw new APIError(result.error || "Failed to render page", 500);
    }

    await sendEmail({
      content: result.html!,
      subDomain,
      subject: "Test Email With Attachment",
      to: "kapil.pipaliya@gmail.com",
    });
    return new Response(
      JSON.stringify({
        message: "Test email sent successfully",
        result: result.html,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: unknown) {
    return handleAPIError(error);
  }
}
