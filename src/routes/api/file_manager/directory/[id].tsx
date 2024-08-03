import type { APIEvent } from "@solidjs/start/dist/server";

import { useParams } from "@solidjs/router";
import { type Node, type Session, int } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { processResult } from "~/cypher/get/evaluate/processResult";
import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function GET({ request }: APIEvent) {
  const params = useParams();
  const id = params.id;
  let neo4jSession: Session | undefined;
  try {
    neo4jSession = await getSessionForSubdomain(request);

    const result = await neo4jSession.run(
      'MATCH (d:Folder)-[:ParentFolder*0..1]->(f) ' +
      'WHERE id(d) = $id ' +
      'OPTIONAL MATCH (f)-[:ParentFolder]->(sub) ' +
      'RETURN f, collect(sub) as subDirs', { id: int(id) }
    );

    const context = {
      nodes: {} as { [key: string]: any },
      relationships: {} as { [key: string]: any },
    };
    const files = processResult(result.records, context, 'f');
    for (const record of result.records) {
      const vertices = record.get('subDirs').map((subDir: Node) => convertNodeToJson(subDir));
      if (context.nodes) {
        for (const vertex of vertices) {
          context.nodes[vertex.id] = vertex;
        }
      }
    }

    const children = result.records.map(record => ({
      file: context.nodes[record.get('f').elementId],
      subDirs: record.get('subDirs').map((subDir: Node) => context.nodes[subDir.elementId])
    }));

    return {
      children,
      files,
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
      }
    };
  } catch (error: unknown) {
    return new Response(error instanceof Error ? error.message : "Unknown error", { status: 500 });
  } finally {
    if (neo4jSession) neo4jSession.close();
  }
}
