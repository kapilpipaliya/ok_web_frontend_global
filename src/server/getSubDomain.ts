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

  // Assuming the URL is something like `subDomain.example.com`
  // Split the host by '.' and check the length
  const parts = hostWithoutPort.split(".");

  // Determine if a subDomain exists (assuming your domain is example.com)
  let subDomain;
  if (parts.length > 2) {
    subDomain = parts[parts.length - 3]; // Get the subDomain part
  } else {
    subDomain = "super"; // Default to 'super' if no subDomain is found
  }

  if (subDomain === "www") {
    return "super";
  }

  return subDomain;
}
