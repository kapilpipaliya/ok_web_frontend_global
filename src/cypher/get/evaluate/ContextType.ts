import { Session } from "neo4j-driver";
import { Edge, Vertex } from "~/lib/graph/graph";

export interface ContextType{
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
    session?: Session,
  }