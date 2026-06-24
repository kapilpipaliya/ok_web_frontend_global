import type { Session } from "neo4j-driver";

import {
  getSchemaCategoryConfig,
  type SchemaCategoryConfig,
  type SchemaContentLabel,
} from "~/lib/schema/schemaCategoryConfig";

export function resolveCategoryFolderSegments(
  categoryKey: string,
  parentMap: ReadonlyMap<string, string>,
): string[] {
  if (!categoryKey) {
    return [];
  }

  const keysLeafToRoot: string[] = [];
  let current: string | undefined = categoryKey;
  const visited = new Set<string>();

  while (current && !visited.has(current)) {
    visited.add(current);
    keysLeafToRoot.push(current);
    current = parentMap.get(current);
  }

  return keysLeafToRoot
    .map((key) => key.trim())
    .filter(Boolean)
    .reverse();
}

async function fetchCategoryParentMap(
  session: Session,
  config: SchemaCategoryConfig,
): Promise<Map<string, string>> {
  const result = await session.run(
    `
    MATCH (child:${config.categoryLabel})-[:${config.edgeType}]->(parent:${config.categoryLabel})
    WHERE child.key IS NOT NULL AND parent.key IS NOT NULL
    RETURN child.key AS childKey, parent.key AS parentKey
    `,
  );

  const parentMap = new Map<string, string>();
  for (const record of result.records) {
    const childKey = record.get("childKey");
    const parentKey = record.get("parentKey");
    if (childKey == null || parentKey == null) continue;
    parentMap.set(String(childKey), String(parentKey));
  }

  return parentMap;
}

export async function fetchSchemaCategoryFolderPaths(
  session: Session,
  contentLabel: SchemaContentLabel,
): Promise<Record<string, string[]>> {
  const config = getSchemaCategoryConfig(contentLabel);
  if (!config) {
    return {};
  }

  const parentMap = await fetchCategoryParentMap(session, config);

  const result = await session.run(
    `
    MATCH (content:${config.contentLabel})-[:${config.edgeType}]->(cat:${config.categoryLabel})
    WHERE content.key IS NOT NULL AND toString(content.key) <> ''
    RETURN content.key AS contentKey, cat.key AS categoryKey
    `,
  );

  const paths: Record<string, string[]> = {};
  for (const record of result.records) {
    const contentKey = record.get("contentKey");
    const categoryKey = String(record.get("categoryKey") ?? "");
    if (contentKey == null || contentKey === "") continue;
    paths[String(contentKey)] = resolveCategoryFolderSegments(
      categoryKey,
      parentMap,
    );
  }

  return paths;
}
