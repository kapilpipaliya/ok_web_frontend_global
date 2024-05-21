import type { APIEvent } from "@solidjs/start/server";
import { getSubDomain } from "~/cypher_api/server/domain_utils";

export async function GET({ request }: APIEvent) {
  const host = request.headers.get("host");
  return new Response(
    `Host: ${host}, Subdomain: ${getSubDomain(request.headers.get("host")!)}`,
  );
}

export function Subdomain() {
  return (
    <div>
      <h1>Subdomain</h1>
    </div>
  );
}
