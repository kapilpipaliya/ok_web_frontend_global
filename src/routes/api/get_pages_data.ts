import { getDriver, isIntegerId } from "~/lib/server/driver";

import { getInitialData } from "./getInitialData";
import { APIEvent } from "@solidjs/start/dist/server";

export async function GET({ request }: APIEvent) {
    const session = (await getDriver("super")).session();
    try {


        const pageList = await getInitialData({});

        return pageList;
    } catch (error) {
        console.error("Server error Failed to login:", error);
        return new Response("Internal Server Error", { status: 500 });
    } finally {
        await session.close();
    }
}
