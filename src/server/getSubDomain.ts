import { parse } from "tldjs";

export async function getSubDomain(host: string) {
  const { subdomain } = parse(host);

  if (!subdomain || subdomain === "www") {
    return "super";
  }

  return subdomain;
}
