import { getHttpsSession } from "~/server/session/getHttpsSession";

export async function getUserEmailFromSession(): Promise<null | string> {
  const httpSession = await getHttpsSession();
  if (!httpSession.data.email) {
    return null;
  }
  return httpSession.data.email;
}
