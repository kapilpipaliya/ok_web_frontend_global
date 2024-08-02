import type { APIEvent } from "@solidjs/start/dist/server";
import type { Node, Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { processResult } from "~/cypher/get/evaluate/processResult";
import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function GET({ request }: APIEvent) {
  let neo4jSession: Session | undefined;
  try {
    neo4jSession = await getSessionForSubdomain(request);

    // directories without a parent directory
    // and their immediate files
    const directoriesResult = await neo4jSession.run(
      'MATCH (d:FileDirectory) ' +
      'WHERE NOT (d)<-[:FileDirectoryFile]-(:FileDirectory) ' +
      'OPTIONAL MATCH (d)-[:FileDirectoryFile]->(f:File) ' +
      'RETURN d, collect(f) as files'
    );

    // root-level files (files that are not connected to any directory)
    const filesResult = await neo4jSession.run(
      'MATCH (f:File) ' +
      'WHERE NOT (f)-[:FileDirectoryFile]->(:FileDirectory) ' +
      'RETURN f'
    );

    const context = {
      nodes: {} as { [key: string]: any },
      relationships: {} as { [key: string]: any },
    };
    processResult(directoriesResult.records, context, 'd');
    for (const record of directoriesResult.records) {
      const vertices = record.get('files').map((file: Node) => convertNodeToJson(file));
      if (context.nodes) {
        for (const vertex of vertices) {
          context.nodes[vertex.id] = vertex;
        }
      }
    }
    const rootFiles = processResult(filesResult.records, context, 'f');

    const rootDirectories = directoriesResult.records.map(record => ({
      directory: context.nodes[record.get('d').elementId],
      files: record.get('files').map((file: Node) => context.nodes[file.elementId])
    }));

    return {
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
      },
      rootDirectories,
      rootFiles
    };
  } catch (error: unknown) {
    return new Response(error instanceof Error ? error.message : "Unknown error", { status: 500 });
  } finally {
    if (neo4jSession) neo4jSession.close();
  }
}
