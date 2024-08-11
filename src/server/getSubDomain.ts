import { getRequestURL } from "vinxi/http";

import { getHttpsSession } from "./getHttpsSession";

export async function getSubDomain(host: string) {
  const url = getRequestURL();
  const _path = url.pathname;
  const _httpSession = await getHttpsSession();

  // Remove the port number if present
  const hostWithoutPort = host.split(":")[0];

  // Check if the host is an IP address
  const isIPAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostWithoutPort);

  if (isIPAddress) {
    return "super"; // Return default 'super' when accessed via IP
  }

  // Assuming the URL is something like `subdomain.example.com`
  // Split the host by '.' and check the length
  const parts = hostWithoutPort.split(".");

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
