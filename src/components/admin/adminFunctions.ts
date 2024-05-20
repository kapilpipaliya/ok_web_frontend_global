import { getDriver } from "~/cypher_api/server/driver";

export async function getUsers() {
    "use server";
    try {
        const driver = (await getDriver('www')).session();
        const res = await driver.run(`MATCH (u:User) RETURN u;`);

        if (res.records.length > 0) {
            const records = res.records.map((record) => {
                const vertex = record.get("u");
                return {
                    id: vertex.identity,
                    L: vertex.labels,
                    P: vertex.properties,
                };
            });

            return {
                error: false,
                vertexes: records
            };
        } else {
            return [];
        }


    } catch (e) {
        console.log(e);
    }
}

