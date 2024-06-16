import { getDriver } from "~/cypher/driver";
import type { APIEvent } from "@solidjs/start/dist/server";
import { getSubDomain } from "~/server/getSubDomain";
import { mutateData } from "../../lib/graph/mutate/mutate";

export async function POST({ request }: APIEvent) {
  const { event, data } = await request.json();
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomain)).session();

  try {
    const result = await mutateData(event, data, session);
    return { message: "Saved Successfully", result };
  } catch (error) {
    console.error("Failed to save data:", error);
    return new Error("Internal Server Error");
  }
}
