import type { Vertex } from "~/lib/graph/graph";

import { getHttpsSession } from "~/server/session/getHttpsSession";

export async function updateSession(user: Vertex) {
  const http_session = await getHttpsSession();
  await http_session.update((oldData) => ({
    ...oldData,
    user,
  }));
}
