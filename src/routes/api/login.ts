import type { APIEvent } from "@solidjs/start/dist/server";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriver, getDriverWithPort } from "~/cypher/driver";
import { getSubDomain } from "~/server/getSubDomain";

import { updateSession } from "../../cypher/mutate/signup/updateSession";

// Main POST function
export async function POST({ request }: APIEvent) {
  const { email, password } = await request.json();
  try {
    const subdomain = await getSubDomain(request.headers.get("host")!);

    const user = await authenticateUser(email, password, subdomain);

    await updateSession(user);

    delete user.P.password;
    return user;
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
    const query =
      "MATCH (u:User) WHERE u.email = $email OR u.username = $email RETURN u";
    const result = await session.run(query, { email });

    if (result.records.length === 0) {
      throw new Error("Not Authorized Email or Username!!!");
    }

    const user = convertNodeToJson(result.records[0].get("u"));

    if (subdomain === "super") {
      return await authenticateSuperUser(user, email, password);
    }
    return authenticateRegularUser(user, password);
  } finally {
    await session.close();
  }
}

// Function to authenticate regular user
function authenticateRegularUser(user: Vertex, password: string) {
  if (user.P.password !== password) {
    throw new Error("Not Authorized Email or Username!");
  }

  return user;
}

// Function to authenticate super user
async function authenticateSuperUser(
  user: { [key: string]: any },
  email: string,
  password: string,
) {
  const userDbSession = (
    await getDriverWithPort(user.properties.driverPort)
  ).session();

  try {
    const query =
      "MATCH (u:User) WHERE u.email = $email OR u.username = $email RETURN u";
    const result = await userDbSession.run(query, { email });
    const res = result.records[0].get("u");

    if (result.records.length === 0) {
      throw new Error("Not Authorized Email or Username!!!!");
    }

    if (res.properties.password === password) {
      return convertNodeToJson(result.records[0].get("u"));
    }
    throw new Error("Not Authorized Email or Username!!!!!!");
  } finally {
    await userDbSession.close();
  }
}
