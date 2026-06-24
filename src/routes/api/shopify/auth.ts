import type { APIEvent } from "@solidjs/start/server";
import { handleAuthRequest } from "./auth/handleAuthRequest";

export async function GET({ request }: APIEvent) {
  return handleAuthRequest(request);
}
