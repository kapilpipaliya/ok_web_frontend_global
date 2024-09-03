import { getHttpsSession } from "~/server/getHttpsSession";

export async function logout() {
  const httpSession = await getHttpsSession();
  await httpSession.update((d) => (d.userId = undefined));
  await httpSession.clear();
}
