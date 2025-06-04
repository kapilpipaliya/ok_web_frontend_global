import type { Node, Session } from "neo4j-driver";

export async function fetchPageById(
  dbSession: Session,
  pageKey: string,
): Promise<Node | null> {
  const result = await dbSession.run(
    `
    MATCH (p:Page {key: $key})
    RETURN p
  `,
    { key: pageKey },
  );

  return result.records.length > 0 ? result.records[0].get("p") : null;
}
