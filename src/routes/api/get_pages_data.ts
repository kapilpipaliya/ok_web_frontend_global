import { getInitialData } from "./getInitialData";
import type { APIEvent } from "@solidjs/start/dist/server";
import { getSubDomain } from "~/cypher_api/server/domain_utils";

export async function GET({ request }: APIEvent) {
  const subdomain = await getSubDomain(request.headers.get("host")!);
  try {
    const pageList = await getInitialData({ subdomain });

    return pageList;
  } catch (error) {
    console.error("Server error Failed to login:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
