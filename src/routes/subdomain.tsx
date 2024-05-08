import { getSubDomain } from "~/lib/domain_utils";
import type { APIEvent } from "@solidjs/start/server";

export async function GET({ request }: APIEvent) {
  const host = request.headers.get("host");
  return new Response(`Host: ${host}, Subdomain: ${getSubDomain(host!)}`);
}

export const Subdomain = () => {
  return (
    <div>
      <h1>Subdomain</h1>
    </div>
  );
};
