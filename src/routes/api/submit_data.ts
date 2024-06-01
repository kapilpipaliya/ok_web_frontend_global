import { getDriver } from "~/cypher_api/server/driver";
import type { APIEvent } from "@solidjs/start/dist/server";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { mutateData } from "./mutate";

export async function POST({ request }: APIEvent) {
  const { event, data } = await request.json();
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomain)).session();
  try {
    const result = await mutateData(event, data, session);
    // await session.close();
    return { message: "Saved Successfully", result };
  } catch (error) {
    // await session.close();
    console.error("Server error Failed to login:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
