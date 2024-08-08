import { getRequestURL } from "vinxi/http";

import { getHttpsSession } from "./getHttpsSession";

export async function getSubDomain(host: string) {
  const url = getRequestURL();
  const _path = url.pathname;
  const _httpSession = await getHttpsSession();

  // if (
  //   isAuthCheck &&
  //   !httpSession.data?.email &&
  //   !path.includes("/api/signup")
  // ) {
  //   throw new Error("Not Authorized");
  // }

  // Assuming the URL is something like `subdomain.example.com`
  // Split the host by '.' and check the length
  const parts = host.split(".");

  // Determine if a subdomain exists (assuming your domain is example.com)
  let subdomain;
  if (parts.length > 2) {
    subdomain = parts[parts.length - 3]; // Get the subdomain part
  } else {
    subdomain = "super"; // Default to 'super' if no subdomain is found
  }
  if (subdomain === "www") {
    return "super";
  }

  return subdomain;
}
