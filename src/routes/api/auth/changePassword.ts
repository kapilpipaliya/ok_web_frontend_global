import type { APIEvent } from "@solidjs/start/dist/server";

// import bcrypt from "bcryptjs";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const { currentPassword, newPassword, uuid } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const userResult = await dbSession.run(
      `MATCH (u:User {uuid: $uuid}) RETURN u`,
      { uuid }
    );

    const user = userResult.records[0]?.get('u').properties;
    
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isSuper) {
      throw new Error("Super user password changes not allowed through this interface");
    }

    // Verify current password
    const isValidPassword = currentPassword === user.password; // await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = newPassword; // await bcrypt.hash(newPassword, 10);

    // Update password
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       SET u.password = $hashedPassword`,
      { hashedPassword, uuid: user.uuid }
    );

    return new Response(JSON.stringify({ success: true }), {
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