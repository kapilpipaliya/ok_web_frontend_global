import {APIEvent} from "@solidjs/start/dist/server";
import {logout} from "~/pages/auth/_server";

export async function POST({request}: APIEvent) {
    try {
        await logout();
        return {
            'message': 'Logout successfully'
        }
    } catch (error) {
        return new Response('Internal Server Error', {status: 500});
    }
}
