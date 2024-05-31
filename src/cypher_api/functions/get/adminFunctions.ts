import { getCookie, getRequestIP, getRequestURL } from "vinxi/http";
import { getHttpsSession } from "~/cypher_api/server/auth/getHttpsSession";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { getDriver } from "~/cypher_api/server/driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";

export async function getUsers() {
  "use server";
  try {
    const host = getRequestURL().hostname;
    const subDomain = await getSubDomain(host);
    const driver = (await getDriver(subDomain)).session();
    const res = await driver.run(`MATCH (u:User) RETURN u;`);

    if (res.records.length > 0) {
      const vertexes = res.records.map((r) => convertNodeToJson(r.get("u")));
      return {
        error: false,
        vertexes: vertexes,
      };
    } else {
      return [];
    }
  } catch (e: any) {
    throw new Response(e.message,{
      status: 500});
  }
}
