import { getDriver } from "~/lib/server/driver";
import { APIEvent } from "@solidjs/start/dist/server";
import { getSubDomain } from "~/lib/server/domain_utils";

export async function POST({ request }: APIEvent) {
  const { data, id } = await request.json();

  const subdomain = getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomain)).session();
    try {
    const query = `MATCH (u:Coll {email: $email, password: $password}) return u;`;
    const result = await session.run(query, {
      data: data,
      id: id,
    });

    const newData = result.records[0].get("u");

    return {
      data: newData,
    };
  } catch (error) {
    console.error("Server error Failed to login:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await session.close();
  }
}
