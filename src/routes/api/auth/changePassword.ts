import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { hashPassword, verifyPassword } from "~/lib/auth/password";
import { renderPageAsMHtml } from "~/lib/playwright/renderPageAsMHtml";
import { sendEmailWithAttachment } from "~/lib/playwright/sendEmailWithAttachment";

import { EMAIL_TEMPLATES } from "./constants/constants";

export async function POST({ request }: APIEvent) {
  const { currentPassword, newPassword, uuid } = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const userResult = await dbSession.run(
      "MATCH (u:User {uuid: $uuid}) RETURN u",
      { uuid },
    );

    const user = userResult.records[0]?.get("u").properties;

    if (!user) {
      throw new APIError("User not found", 404);
    }

    if (user.isSuper) {
      throw new APIError(
        "Super user password changes not allowed through this interface",
        403,
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(
      currentPassword,
      user.password,
      user.salt,
    );
    if (!isValidPassword) {
      throw new APIError("Current password is incorrect", 401);
    }

    // Hash new password
    const { hashedPassword, salt } = await hashPassword(newPassword);

    // Update password and salt
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       SET u.password = $hashedPassword,
           u.salt = $salt`,
      { hashedPassword, salt, uuid: user.uuid },
    );

    const result = await renderPageAsMHtml({
      neo4jSession: dbSession,
      pageName: EMAIL_TEMPLATES.PASSWORD_CHANGED,
      queryParams: {
        changeTime: new Date().toISOString(),
        username: user.username,
      },
      subDomain,
    });

    if (result.success && result.result) {
      const fileVertex = result.result[0];
      await sendEmailWithAttachment({
        emailSubject: "Your Password Has Been Changed",
        emailTo: user.email,
        fileVertex,
        subDomain,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
