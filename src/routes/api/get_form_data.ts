import { getDriver, isIntegerId } from "~/lib/server/driver";
import { getHttpsSession } from "~/lib/auth/_server";

import { APIEvent } from '@solidjs/start/dist/server';
import { getInitialData } from "./getInitialData";


export async function GET({ request }: APIEvent) {
    // const { formName, formId } = await request.json();

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
