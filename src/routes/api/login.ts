import {
  getDriver,
  getDriverWithPort,
} from "~/cypher_api/server/driver";
import type { APIEvent } from "@solidjs/start/dist/server";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { getHttpsSession } from "~/cypher_api/server/auth/getHttpsSession";

// Main POST function
export async function POST({ request }: APIEvent) {
  const { email, password } = await request.json();
  try {
    const subdomain = await getSubDomain(request.headers.get("host")!, false);

    const user = await authenticateUser(email, password, subdomain);

    const httpSession = await getHttpsSession();
    await httpSession.update((oldData) => ({
      ...oldData,
      subdomain,
      email: user.properties.email,
    }));

    const { password: _, ...properties } = user.properties;
    return {
      id: user.identity.toString(),
      properties,
    };
  } catch (error: any) {
    console.error("Server error Failed to login:", error);
    return new Response(error.message, { status: 500 });
  }
}

// Function to authenticate user credentials
async function authenticateUser(
  email: string,
  password: string,
  subdomain: string,
) {
  const session = (await getDriver(subdomain)).session();

  try {
    const query = `MATCH (u:User {email: $email}) RETURN u`;
    const result = await session.run(query, { email });

    if (result.records.length === 0) {
      throw new Error("Not Authorized Email!");
    }

    const user = result.records[0].get("u");

    if (subdomain === "super") {
      return await authenticateSuperUser(user, email, password);
    } else {
      return authenticateRegularUser(user, password);
    }
  } finally {
    await session.close();
  }
}

// Function to authenticate regular user
function authenticateRegularUser(
  user: { [key: string]: any },
  password: string,
) {
  if (user.properties.password !== password) {
    throw new Error("Not Authorized Email!");
  }

  return user;
}

// Function to authenticate super user
async function authenticateSuperUser(
  user: { [key: string]: any },
  email: string,
  password: string,
) {
  const session = (
    await getDriverWithPort(user.properties.driverPort)
  ).session();

  try {
    const query = `MATCH (u:User {email: $email}) RETURN u`;
    const result = await session.run(query, { email });
    const res = result.records[0].get("u");

    if (result.records.length === 0) {
      throw new Error("Not Authorized Email!");
    }

    if (res.properties.password === password) {
      return result.records[0].get("u");
    } else {
      throw new Error("Not Authorized Email!");
    }
  } finally {
    await session.close();
  }
}
