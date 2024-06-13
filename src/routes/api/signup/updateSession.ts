import {Vertex} from "~/lib/graph/graph";
import {getHttpsSession} from "~/server/getHttpsSession";

export async function updateSession(createUserResult: Vertex) {
  const http_session = await getHttpsSession();
  await http_session.update((oldData) => ({
    ...oldData,
    email: createUserResult.P.email,
    subdomain: createUserResult.P.subdomain,
  }));
}