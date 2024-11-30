import tld from "tldts";

export async function getSubDomain(host: string) {
  const { subdomain } = tld.parse(host);

  if (!subdomain || subdomain === "www") {
    return "super";
  }

  return subdomain;
}
