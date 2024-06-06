import { getDriver } from "~/cypher_api/server/driver";
import type { APIEvent } from "@solidjs/start/dist/server";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { mutateData } from "./mutate";

export async function POST({ request }: APIEvent) {
  const { event, data } = await request.json();
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomain)).session();
  
  try {
    // const checkQuery = id
    //   ? 'MATCH (v) WHERE v.name = $name AND id(v) != $id RETURN v'
    //   : 'MATCH (v) WHERE v.name = $name RETURN v';

    // const params = id ? { name, id } : { name };
    // const checkResult = await session.run(checkQuery, params);

    // if (checkResult.records.length > 0) {
    //   return new Error('Vertex with the same name already exists.');
    // }
    const result = await mutateData(event, data, session);
    // await session.close();
    return { message: "Saved Successfully", result };
  } catch (error) {
    // await session.close();
    console.error("Failed to save data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
