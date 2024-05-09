import { getDriver, isIntegerId } from "~/lib/server/driver";
import { APIEvent } from "@solidjs/start/dist/server";
import { getHttpsSession } from "~/lib/auth/_server";
import { getSubDomain } from "~/lib/server/domain_utils";

export async function POST({ request }: APIEvent) {
  const { email, password } = await request.json();
  const subdomain = getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomain)).session();
  try {
    const query = `MATCH (u:User {email: $email, password: $password}) return u;`;
    const result = await session.run(query, {
      email: email,
      password: password,
    });
    if (result.records.length === 0) {
      return { error: "Not Authorized !" };
    }

    // TODO: User found, now check the password

    const user = result.records[0].get("u");
    console.log(user.properties);

    const http_session = await getHttpsSession();
    await http_session.update((oldData) => ({
      ...oldData,
      subdomain: user.properties.subdomain,
      email: user.properties.email,
    }));
    const { password: _, ...properties } = user.properties;
    return {
      id: !isIntegerId ? user.identity.toNumber() : user.identity,
      properties,
    };
  } catch (error) {
    console.error("Server error Failed to login:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await session.close();
  }
}
