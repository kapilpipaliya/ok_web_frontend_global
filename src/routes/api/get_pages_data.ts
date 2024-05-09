import { getDriver } from "~/lib/server/driver";

import { getInitialData } from "./getInitialData";
import { APIEvent } from "@solidjs/start/dist/server";
import { getSubDomain } from "~/lib/server/domain_utils";

export async function GET({ request }: APIEvent) {
  const subdomain = getSubDomain(request.headers.get("host")!);
  try {
    const pageList = await getInitialData({ subdomain });

    return pageList;
  } catch (error) {
    console.error("Server error Failed to login:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
