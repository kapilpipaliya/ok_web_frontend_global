import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";
import Hjson from "hjson";
import SystemTextInputSchemaRaw from "./SystemTextInput.hjson?raw";

interface SchemaResult {
  vertexes: Vertex[];
  edges: Edge[];
}

export const componentSchemas: Record<string, SchemaResult> = {
  SystemTextInput: Hjson.parse(SystemTextInputSchemaRaw),
};
