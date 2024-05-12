import {getDriver, isIntegerId} from "~/cypher_api/server/driver";
import { getHttpsSession } from "./getHttpsSession";

// Dont export not 'use server' functions.

// use this function in all api to find if user is logged in or not?
export const getUser = async () => {
  "use server";
  // try {
  
  const httpSession = await getHttpsSession();
  if (httpSession.data?.subdomain === undefined) {
    return { error: "Not Authorized Domain" };
  }
  const neo4jSession = (await getDriver(httpSession.data?.subdomain)).session();

  // session only works with https
  const email = httpSession.data.email;
  if (email === undefined) {
    return { error: "Not Authorized Email" };
  }
  const query = `MATCH (u:User {email: $email}) return u;`;
  const result = await neo4jSession.run(query, { email: email });

  if (result.records.length === 0) {
    return { error: `Not Authorized Email ${email}` };
  }
  const user = result.records[0].get("u");
  const { password, ...properties } = user.properties;

  return {
    id: !isIntegerId ? user.identity.toNumber() : user.identity,
    properties,
  };

  // } catch (error) {
  //     console.error('Server error Failed to login:', error);
  //     return new Response('Internal Server Error', {status: 500});
  // }
};
