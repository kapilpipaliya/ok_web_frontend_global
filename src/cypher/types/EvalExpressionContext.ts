import type { Session, Transaction } from "neo4j-driver";

import type { Edge } from "~/lib/graph/type/edge";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

export interface EvalExpressionContext {
  useSessionShop?: boolean;
  subDomain?: string;
  functionLookupSession?: Session;
  functionLookupSubDomain?: string;
  nodes?: { [key: string]: Vertex };
  relationships?: { [key: string]: Edge };
  tx?: Transaction;
  vertexes?: Vertex[];
  request?: Request;
  deletedEdges?: Id[];
  deletedVertexes?: Id[];
  dbSession?: Session;
  rawSubDomain?: string;
  /** subdomain-level DB session for Shopify credential lookup. Passed when invoking from contextAwareExecuteNamedServerFunction. */
  rawDbSession?: Session;
}
