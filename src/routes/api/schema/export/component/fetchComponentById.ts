import type { Node, Session } from "neo4j-driver";

export async function fetchComponentById(
  dbSession: Session,
  componentKey: string,
): Promise<Node | null> {
  const result = await dbSession.run(
    `
    MATCH (c:Component {key: $key})
    RETURN c
  `,
    { key: componentKey },
  );

  return result.records.length > 0 ? result.records[0].get("c") : null;
}
