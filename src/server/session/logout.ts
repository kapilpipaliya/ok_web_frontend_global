import { getHttpsSession } from "~/server/session/getHttpsSession";

export async function logout() {
  const httpSession = await getHttpsSession();
  await httpSession.update((d) => (d.userId = undefined));
  await httpSession.clear();
}
