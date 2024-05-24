import { APIEvent } from "@solidjs/start/dist/server";
import { getHttpsSession } from "~/cypher_api/server/auth/getHttpsSession";

// Cant export this function
async function logout() {
  const session = await getHttpsSession();
  await session.update((d) => (d.userId = undefined));
  await session.clear();
}

export async function POST({ request }: APIEvent) {
  try {
    await logout();
    return {
      message: "Logout successfully",
    };
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
