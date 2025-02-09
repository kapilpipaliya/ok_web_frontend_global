import type { DeepPartial } from "ai";

import { z } from "zod";

// define schema for the graph interface
export const graphInterfaceSchema = z.object({
  edges: z
    .array(
      z.object({
        // P: z.object({}).describe('Properties associated with the edge'),
        E: z.string().describe("End vertex ID of the edge"),
        id: z.string().describe("Unique identifier for the edge"),
        S: z.string().describe("Start vertex ID of the edge"),
        T: z.string().describe("Type/label of the edge"),
      }),
    )
    .describe(
      "Array of Edge objects representing connections between vertices. return empty array if no edges",
    )
    .optional(),

  vertexes: z
    .array(
      z.object({
        id: z.string().describe("Unique identifier for the vertex"),
        //IN: z.record(z.string(), z.array(z.string())).describe('Map of incoming edge types to arrays of target edge IDs'),
        L: z
          .array(z.string())
          .describe("Labels/types associated with the vertex"),
        //OUT: z.record(z.string(), z.array(z.string())).describe('Map of outgoing edge types to arrays of target edge IDs'),
        P: z.object({}).describe("Properties associated with the vertex"),
      }),
    )
    .describe("Array of Vertex objects representing nodes in the graph"),
});

// define type for partial graph interface during generation
export type PartialGraphInterface = DeepPartial<typeof graphInterfaceSchema>;
