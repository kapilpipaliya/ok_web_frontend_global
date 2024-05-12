import type { APIEvent } from "@solidjs/start/server";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { getDriver } from "~/cypher_api/server/driver";

export async function POST({ request }: APIEvent) {
    const subdomain = getSubDomain(request.headers.get("host")!);
    const session = (await getDriver(subdomain)).session();
    if (subdomain === "super") {
        return {success: true};
    }

    try {
        const query = `MATCH (u:User {subdomain: '${subdomain}'}) RETURN u;`;
        const result = await session.run(query);
        if (result.records.length === 0) {
            return {error: 'Subdomain is not valid'};
        }
        const user= result.records[0].get("u");
        const { password: _, ...properties } = user.properties;
        
        return properties;
    } catch (error) {
        console.error("Failed to execute query:", error);
        throw error;
    }
    
}

