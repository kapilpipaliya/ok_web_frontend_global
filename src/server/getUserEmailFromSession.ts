import { getHttpsSession } from "~/server/getHttpsSession";

export async function getUserEmailFromSession(): Promise<string> {
  const httpSession = await getHttpsSession();
  if (!httpSession.data.email) {
    throw new Error("Not Authorized: Email is undefined");
  }
  return httpSession.data.email;
}
