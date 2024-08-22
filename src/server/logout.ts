import { getHttpsSession } from "~/server/getHttpsSession";

export async function logout() {
  const session = await getHttpsSession();
  await session.update((d) => (d.userId = undefined));
  await session.clear();
}
