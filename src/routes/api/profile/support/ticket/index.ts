import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const { email, key, message, subject } = payload;

    const query = `CREATE (n:Support {key: $key, email: $email, subject: $subject, message: $message, status: "pending"}) SET n.createdAt = localDateTime() RETURN n;`;
    await dbSession.run(query, {
      email,
      key,
      message,
      subject,
    });
    return {
      message: "Message sent successfully",
    };
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  } finally {
    await dbSession.close();
  }
} 