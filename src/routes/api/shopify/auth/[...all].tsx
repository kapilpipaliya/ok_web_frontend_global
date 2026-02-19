import type { APIEvent } from "@solidjs/start/server";

import { handleAuthRequest } from "./handleAuthRequest";

export async function GET({ request }: APIEvent) {
  return handleAuthRequest(request);
}

// export async function POST({ request }: APIEvent) {
//   return handleAuthRequest(request);
// }
