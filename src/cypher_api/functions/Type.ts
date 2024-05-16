
import {
  Node as Neo4jNode,
  Relationship as Neo4jRelationship,
} from "neo4j-driver";
export type Id = number | string | any;

export interface Node extends Partial<Neo4jNode> {
    id: Id;
    L: string[];
    P: {
      [key: string]: any;
    };
    IN: { [key: string]: Id[] };
    OUT: { [key: string]: Id[] };
  }
  
  export interface NodeUnsafe {
    id?: Id;
    L?: string[];
    P: { [key: string]: any };
    IN?: { [key: string]: Id[] };
    OUT?: { [key: string]: Id[] };
  }
  
  export interface Relationship extends Partial<Neo4jRelationship> {
    id: Id;
    P: { [key: string]: any };
    T: string;
    S: Id;
    E: Id;
  }
  
  export type VertexMap = { [key: string]: Node };
  export type EdgeMap = { [key: string]: Relationship };