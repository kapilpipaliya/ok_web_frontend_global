import { getDriver, isIntegerId } from "~/lib/server/driver";
import { APIEvent } from "@solidjs/start/dist/server";
import { getHttpsSession } from "~/lib/auth/_server";

export async function POST({ request }: APIEvent) {
    const { data,id } = await request.json();

    const session = (await getDriver("super")).session();
    try {

        const query = `MATCH (u:Coll {email: $email, password: $password}) return u;`;
        const result = await session.run(query, {
            data: data,
            id: id
        });

        const newData = result.records[0].get("u");

        return {
            data: newData
        };
    } catch (error) {
        console.error("Server error Failed to login:", error);
        return new Response("Internal Server Error", { status: 500 });
    } finally {
        await session.close();
    }
}
