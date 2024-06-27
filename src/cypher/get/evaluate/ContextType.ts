import type { Session } from "neo4j-driver";
import type { TransactionPromise } from "neo4j-driver-core";
import type { Edge, Vertex } from "~/lib/graph/graph";

export interface ContextType{
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
    session?: Session,
    tx?: TransactionPromise
  }