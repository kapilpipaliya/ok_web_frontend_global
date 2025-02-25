import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const { email, key, message, subject } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    await dbSession.run(
      `CREATE (n:Support {
        key: $key,
        email: $email, 
        subject: $subject,
        message: $message,
        status: "pending",
        createdAt: datetime()
      }) RETURN n`,
      { email, key, message, subject },
    );

    return new Response(
      JSON.stringify({ message: "Support ticket created successfully" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 201,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  } finally {
    await dbSession.close();
  }
}
