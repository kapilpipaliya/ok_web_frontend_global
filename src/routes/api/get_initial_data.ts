import type {APIEvent} from "@solidjs/start/dist/server";

import {getInitialData} from "~/cypher/get/getInitialData";
import {getSubDomain} from "~/server/getSubDomain";

export async function GET({ request }: APIEvent) {
  const subdomain = await getSubDomain(request.headers.get("host")!);

  try {
    const data = await getInitialData({ subdomain });
    return data;
  } catch (error) {
    console.error("Failed to get Initial Data", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
