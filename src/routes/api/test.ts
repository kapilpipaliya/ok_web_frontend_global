import {APIEvent} from "@solidjs/start/dist/server";
import {isLoggedIn} from "~/routes/api/login";

export async function GET({params}: APIEvent) {
    if (!await isLoggedIn()) {
        return new Response('Unauthorized', {status: 401});
    }
    return {
        status: 200
    }
}
