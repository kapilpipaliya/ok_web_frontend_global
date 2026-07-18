import type { Transaction } from "neo4j-driver";

import {
  getSchemaCategoryConfig,
  type SchemaCategoryConfig,
  type SchemaContentLabel,
} from "~/lib/schema/schemaCategoryConfig";

export interface EnsureSchemaCategoryResult {
  categoryCreated: boolean;
  linked: boolean;
  categoryKey: string;
}

async function ensureCategoryHierarchy(
  tx: Transaction,
  config: SchemaCategoryConfig,
  segments: string[],
): Promise<string> {
  let parentKey: string | null = null;

  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    const categoryKey = segment;

    if (parentKey === null) {
      await tx.run(
        `
        MERGE (cat:${config.categoryLabel} {key: $categoryKey})
        ON CREATE SET
          cat.name = $categoryName,
          cat.displayOrder = $displayOrder,
          cat.createdAt = datetime()
        SET cat.updatedAt = datetime()
        `,
        {
          categoryKey,
          categoryName: segment,
          displayOrder: index + 1,
        },
      );
    } else {
      await tx.run(
        `
        MERGE (cat:${config.categoryLabel} {key: $categoryKey})
        ON CREATE SET
          cat.name = $categoryName,
          cat.displayOrder = $displayOrder,
          cat.createdAt = datetime()
        SET cat.updatedAt = datetime()
        WITH cat
        MATCH (parent:${config.categoryLabel} {key: $parentKey})
        MERGE (cat)-[r:${config.edgeType}]->(parent)
        ON CREATE SET r.createdAt = datetime()
        `,
        {
          categoryKey,
          categoryName: segment,
          displayOrder: index + 1,
          parentKey,
        },
      );
    }

    parentKey = categoryKey;
  }

  const categoryKey = segments[segments.length - 1];
  const result = await tx.run(
    `
    MATCH (cat:${config.categoryLabel} {key: $categoryKey})
    RETURN elementId(cat) AS id
    `,
    { categoryKey },
  );

  const categoryId = result.records[0]?.get("id");
  if (!categoryId) {
    throw new Error(
      `Failed to resolve ${config.categoryLabel} with key "${categoryKey}"`,
    );
  }

  return String(categoryId);
}

export async function ensureImportedSchemaItemCategory(
  tx: Transaction,
  contentLabel: SchemaContentLabel,
  contentKey: string,
  categorySegments: string[] = [],
): Promise<EnsureSchemaCategoryResult> {
  const config = getSchemaCategoryConfig(contentLabel);
  if (!config || categorySegments.length === 0) {
    return { categoryCreated: false, linked: false, categoryKey: "" };
  }

  const categoryKey = categorySegments[categorySegments.length - 1];

  await tx.run(
    `
    MATCH (content:${config.contentLabel} {key: $contentKey})
    OPTIONAL MATCH (content)-[oldRel:${config.edgeType}]->(:${config.categoryLabel})
    DELETE oldRel
    `,
    { contentKey },
  );

  const categoryId = await ensureCategoryHierarchy(
    tx,
    config,
    categorySegments,
  );

  const linkResult = await tx.run(
    `
    MATCH (content:${config.contentLabel} {key: $contentKey})
    MATCH (cat:${config.categoryLabel})
    WHERE elementId(cat) = $categoryId
    MERGE (content)-[r:${config.edgeType}]->(cat)
    ON CREATE SET r.createdAt = datetime()
    RETURN r
    `,
    { contentKey, categoryId },
  );

  return {
    categoryCreated: true,
    linked: linkResult.records.length > 0,
    categoryKey,
  };
}
