import { Vertex } from "~/lib/graph/graph";
import { getHttpsSession } from "~/server/session/getHttpsSession";

export async function getUserFromSession(): Promise<Vertex | void> {
  const httpSession = await getHttpsSession();
  return httpSession?.data?.user;
} 