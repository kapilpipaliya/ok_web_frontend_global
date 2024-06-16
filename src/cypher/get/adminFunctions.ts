import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "~/server/getSubDomain";
import { getDriver } from "~/cypher/driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";

export async function getUsers() {
  "use server";
  try {
    const host = getRequestURL().hostname;
    const subDomain = await getSubDomain(host);
    const driver = (await getDriver(subDomain)).session();
    const res = await driver.run("MATCH (u:User) RETURN u;");

    if (res.records.length > 0) {
      const vertexes = res.records.map((r) => convertNodeToJson(r.get("u")));
      return {
        error: false,
        vertexes: vertexes,
      };
    }
    return [];
  } catch (e: any) {
    throw new Response(e.message, {
      status: 500,
    });
  }
}
