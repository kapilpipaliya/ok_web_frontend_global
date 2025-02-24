import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";

export async function POST({ request }: APIEvent) {
  const { profileImage, uuid } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    if (!profileImage) {
      throw new APIError("Profile image is required", 400);
    }

    // First check if the relationship already exists
    const existingResult = await dbSession.run(
      `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
       WHERE elementId(f) = $profileImage
       RETURN r`,
      { profileImage, uuid },
    );

    // If relationship exists, delete other relationships and return
    if (existingResult.records.length > 0) {
      await dbSession.run(
        `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
         WHERE elementId(f) <> $profileImage
         DELETE r`,
        { profileImage, uuid },
      );
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    }

    // Delete all existing UserProfileImage relationships
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
       DELETE r`,
      { uuid },
    );

    // Create new relationship
    const result = await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       MATCH (f:File) WHERE elementId(f) = $profileImage
       MERGE (u)-[:UserProfileImage]->(f)
       RETURN u, f`,
      { profileImage, uuid },
    );

    if (!(result.records[0]?.get("u") && result.records[0]?.get("f"))) {
      throw new APIError("User or file not found", 404);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
