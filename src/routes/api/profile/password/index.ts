import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const { currentPassword, newPassword, username } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const findUserResult = await dbSession.run(
      "MATCH (u:User) WHERE u.password = $password AND u.username = $username RETURN u",
      { password: currentPassword, username }
    );

    if (findUserResult.records.length === 0) {
      return new Response(JSON.stringify({ error: "Current password is invalid" }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    const updateResult = await dbSession.run(
      "MATCH (u:User {username: $username}) SET u.password = $password RETURN u",
      { password: newPassword, username }
    );

    if (updateResult.records.length === 0) {
      throw new Error("Failed to update password");
    }

    return new Response(JSON.stringify({ message: "Password updated successfully" }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  } finally {
    await dbSession.close();
  }
}
