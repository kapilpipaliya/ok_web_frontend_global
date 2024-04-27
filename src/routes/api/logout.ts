import {APIEvent} from "@solidjs/start/dist/server";
import {logout} from "~/pages/auth/_server";

export async function POST({request}: APIEvent) {
    return logout()
}
