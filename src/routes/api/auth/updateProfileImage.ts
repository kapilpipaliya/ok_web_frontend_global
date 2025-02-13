import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const { profileImage, uuid } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    if (!profileImage) {
      throw new Error("Profile image is required");
    }

    // First check if the relationship already exists
    const existingResult = await dbSession.run(
      `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
       WHERE elementId(f) = $profileImage
       RETURN r`,
      { profileImage, uuid }
    );

    // If relationship exists, delete other relationships and return
    if (existingResult.records.length > 0) {
      await dbSession.run(
        `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
         WHERE elementId(f) <> $profileImage
         DELETE r`,
        { profileImage, uuid }
      );
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    }

    // Delete all existing UserProfileImage relationships
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
       DELETE r`,
      { uuid }
    );

    // Create new relationship
    const result = await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       MATCH (f:File) WHERE elementId(f) = $profileImage
       MERGE (u)-[:UserProfileImage]->(f)
       RETURN u, f`,
      { profileImage, uuid }
    );

    if (!result.records[0]?.get('u') || !result.records[0]?.get('f')) {
      throw new Error("User or file not found");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response("An unknown error occurred", { status: 500 });
  } finally {
    await dbSession.close();
  }
}