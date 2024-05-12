import type { APIEvent } from "@solidjs/start/server";
import { getInitialData } from "./getInitialData";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { getDriver } from "~/cypher_api/server/driver";
import { getHttpsSession } from "~/cypher_api/server/auth/getHttpsSession";

export async function GET({ request }: APIEvent) {
  const subdomain = getSubDomain(request.headers.get("host")!);
  let data = {};
  try {
    data = getInitialData({ subdomain });
  } catch (error) {
    console.error("Failed to execute query:", error);
    throw error;
  } finally {
    // TODO: If I uncomment its giving error
    // await session.close();
    // await getDriver('super').close();
  }
  return data;
}

export function POST() {
  // ...
}

export function PATCH() {
  // ...
}

export function DELETE() {
  // ...
}
