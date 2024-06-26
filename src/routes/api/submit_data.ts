import { getDriver } from "~/cypher/driver";
import type { APIEvent } from "@solidjs/start/dist/server";
import { getSubDomain } from "~/server/getSubDomain";
import { mutateData } from "~/cypher/mutate/mutate_api/mutateData";

export async function POST({ request }: APIEvent) {
  const data = await request.json();
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomain)).session();

  try {
    return await mutateData(data, session);
  } catch (error) {
    console.error("Failed to save data:", error);
    return new Error("Internal Server Error");
  }
}
