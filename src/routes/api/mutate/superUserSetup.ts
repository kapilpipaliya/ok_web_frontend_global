import type { APIEvent } from "@solidjs/start/dist/server";

import { setupSuperUser } from "~/cypher/mutate/manage/setupSuperUser";

export async function GET({ request }: APIEvent) {
  try {
    const { error, status, user } = await setupSuperUser();

    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    return new Response(JSON.stringify(user), { status });
  } catch (error: unknown) {
    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 },
    );
  }
}
