import type { Session } from "neo4j-driver";
import type { Edge, Vertex } from "~/lib/graph/graph";

export interface ContextType{
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
    session?: Session,
  }