import type { Session, Transaction } from "neo4j-driver";

import type { Edge, Vertex } from "~/lib/graph/graph";

export interface EvalExpressionContext {
  dbSession?: Session;
  nodes?: { [key: string]: Vertex };
  relationships?: { [key: string]: Edge };
  tx?: Transaction;
  vertexes?: Vertex[];
}
