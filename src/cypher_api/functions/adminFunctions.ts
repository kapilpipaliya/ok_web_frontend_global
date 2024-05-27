import { getCookie, getRequestIP, getRequestURL } from "vinxi/http";
import { getHttpsSession } from "~/cypher_api/server/auth/getHttpsSession";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { getDriver } from "~/cypher_api/server/driver";

export async function getUsers() {
  "use server";
  try {
    const host = getRequestURL().hostname;
    const subDomain = await getSubDomain(host);
    const driver = (await getDriver(subDomain)).session();
    const res = await driver.run(`MATCH (u:User) RETURN u;`);

    if (res.records.length > 0) {
      const records = res.records.map((record) => {
        const vertex = record.get("u");
        // todo: use convertNodeToJson Function
        return {
          id: vertex.identity,
          L: vertex.labels,
          P: vertex.properties,
        };
      });

      return {
        error: false,
        vertexes: records,
      };
    } else {
      return [];
    }
  } catch (e) {
    console.log(e);
  }
}
