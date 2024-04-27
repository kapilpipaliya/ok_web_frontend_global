import {APIEvent} from "@solidjs/start/dist/server";
import {getUser} from "~/pages/auth/auth";

export async function GET({params}: APIEvent) {
    if (!await getUser()) {
        return new Response('Unauthorized', {status: 401});
    }
    return {
        status: 200
    }
}
