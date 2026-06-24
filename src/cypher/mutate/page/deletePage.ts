import type { Session, Transaction } from "neo4j-driver";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { APIError } from "~/lib/api/server/apiErrorHandler";
import type { Vertex } from "~/lib/graph/type/vertex";

export type DeletableVertexType =
  | "Page"
  | "EmailTemplate"
  | "Component"
  | "Function"
  | "Theme";

export async function replaceVertexProperties(
  sessionOrTx: Session | Transaction,
  vertexId: string,
  properties: Record<string, unknown>,
): Promise<Vertex> {
  const result = await sessionOrTx.run(
    `
      MATCH (v)
      WHERE elementId(v) = $id
      SET v = $properties, v.updatedAt = localDateTime()
      RETURN v
    `,
    { id: vertexId, properties },
  );

  if (result.records.length === 0) {
    throw new APIError("Vertex not found", 404);
  }

  return convertNodeToJson(result.records[0].get("v"));
}

/**
 * Deletes child nodes (Attrs, variants, layouts, etc.) while keeping the root vertex.
 */
export async function deleteVertexChildren(
  sessionOrTx: Session | Transaction,
  vertexId: string,
  vertexType: DeletableVertexType,
): Promise<{
  deletedVertexCount: number;
  deletedEdgeCount: number;
  deletedVertexIds: string[];
  deletedEdgeIds: string[];
}> {
  let deletedVertexCount = 0;
  let deletedEdgeCount = 0;
  const deletedVertexIds: string[] = [];
  const deletedEdgeIds: string[] = [];

  const collectDeletion = (
    nodeIds: string[] | null | undefined,
    edgeIds: string[] | null | undefined,
  ) => {
    if (nodeIds?.length) {
      deletedVertexIds.push(...nodeIds);
      deletedVertexCount += nodeIds.length;
    }
    if (edgeIds?.length) {
      deletedEdgeIds.push(...edgeIds);
      deletedEdgeCount += edgeIds.length;
    }
  };

  const attrResult = await sessionOrTx.run(
    `
      MATCH (v:${vertexType})
      WHERE elementId(v) = $id
      OPTIONAL MATCH (v)-[:Attr]->(rootAttr:Attr)
      OPTIONAL MATCH path = (rootAttr)-[:Attr*0..]->(descendantAttr:Attr)
      WITH v, rootAttr, descendantAttr, length(path) as depth
      ORDER BY depth DESC
      WITH v, collect(DISTINCT descendantAttr) + collect(DISTINCT rootAttr) as allAttrs
      UNWIND allAttrs as attr
      MATCH (attr)-[r]-()
      WITH attr, collect(DISTINCT elementId(attr)) as nodeIds, collect(DISTINCT elementId(r)) as edgeIds
      DETACH DELETE attr
      RETURN reduce(acc = [], n IN collect(nodeIds) | acc + n) as deletedNodeIds,
             reduce(acc = [], e IN collect(edgeIds) | acc + e) as deletedEdgeIds
    `,
    { id: vertexId },
  );

  if (attrResult.records.length > 0) {
    const record = attrResult.records[0];
    collectDeletion(record.get("deletedNodeIds"), record.get("deletedEdgeIds"));
  }

  if (vertexType === "Component") {
    const variantResult = await sessionOrTx.run(
      `
        MATCH (c:Component)
        WHERE elementId(c) = $id
        OPTIONAL MATCH (c)-[r1:ComponentVariant]->(cv:ComponentVariant)
        OPTIONAL MATCH (cv)-[r2:ComponentVariantOption]->(cvo:ComponentVariantOption)
        WITH cv, cvo,
             collect(DISTINCT elementId(cvo)) + collect(DISTINCT elementId(cv)) as nodeIds,
             collect(DISTINCT elementId(r1)) + collect(DISTINCT elementId(r2)) as edgeIds
        DETACH DELETE cvo, cv
        RETURN nodeIds as deletedNodeIds, edgeIds as deletedEdgeIds
      `,
      { id: vertexId },
    );

    if (variantResult.records.length > 0) {
      const record = variantResult.records[0];
      collectDeletion(
        record.get("deletedNodeIds"),
        record.get("deletedEdgeIds"),
      );
    }
  }

  let previewRelType: string | null = null;
  if (vertexType === "Page") {
    previewRelType = "PagePreview";
  } else if (vertexType === "EmailTemplate") {
    previewRelType = "EmailTemplatePreview";
  } else if (vertexType === "Component") {
    previewRelType = "ComponentPreview";
  }

  if (previewRelType) {
    const previewResult = await sessionOrTx.run(
      `
        MATCH (v:${vertexType})
        WHERE elementId(v) = $id
        OPTIONAL MATCH (v)-[r:${previewRelType}]->(f:File)
        WITH f, collect(DISTINCT elementId(f)) as nodeIds, collect(DISTINCT elementId(r)) as edgeIds
        DETACH DELETE f
        RETURN nodeIds as deletedNodeIds, edgeIds as deletedEdgeIds
      `,
      { id: vertexId },
    );

    if (previewResult.records.length > 0) {
      const record = previewResult.records[0];
      collectDeletion(
        record.get("deletedNodeIds"),
        record.get("deletedEdgeIds"),
      );
    }
  }

  if (vertexType === "Page") {
    const rolePageResult = await sessionOrTx.run(
      `
        MATCH (p:Page)
        WHERE elementId(p) = $id
        OPTIONAL MATCH (p)<-[r1:RolePagePage]-(rp:RolePage)<-[r2:RolePage]-(:Role)
        WITH rp,
             collect(DISTINCT elementId(rp)) as nodeIds,
             collect(DISTINCT elementId(r1)) + collect(DISTINCT elementId(r2)) as edgeIds
        DETACH DELETE rp
        RETURN nodeIds as deletedNodeIds, edgeIds as deletedEdgeIds
      `,
      { id: vertexId },
    );

    if (rolePageResult.records.length > 0) {
      const record = rolePageResult.records[0];
      collectDeletion(
        record.get("deletedNodeIds"),
        record.get("deletedEdgeIds"),
      );
    }

    const pageUniqueResult = await sessionOrTx.run(
      `
        MATCH (p:Page)
        WHERE elementId(p) = $id
        OPTIONAL MATCH (p)-[r:PageUnique]->(pu:PageUnique)
        WITH pu,
             collect(DISTINCT elementId(pu)) as nodeIds,
             collect(DISTINCT elementId(r)) as edgeIds
        DETACH DELETE pu
        RETURN nodeIds as deletedNodeIds, edgeIds as deletedEdgeIds
      `,
      { id: vertexId },
    );

    if (pageUniqueResult.records.length > 0) {
      const record = pageUniqueResult.records[0];
      collectDeletion(
        record.get("deletedNodeIds"),
        record.get("deletedEdgeIds"),
      );
    }

    const pageLayoutResult = await sessionOrTx.run(
      `
        MATCH (p:Page)
        WHERE elementId(p) = $id
        OPTIONAL MATCH (p)-[r:PageLayout]->(pl:PageLayout)
        WITH pl,
             collect(DISTINCT elementId(pl)) as nodeIds,
             collect(DISTINCT elementId(r)) as edgeIds
        DETACH DELETE pl
        RETURN nodeIds as deletedNodeIds, edgeIds as deletedEdgeIds
      `,
      { id: vertexId },
    );

    if (pageLayoutResult.records.length > 0) {
      const record = pageLayoutResult.records[0];
      collectDeletion(
        record.get("deletedNodeIds"),
        record.get("deletedEdgeIds"),
      );
    }
  }

  return {
    deletedVertexCount,
    deletedEdgeCount,
    deletedVertexIds,
    deletedEdgeIds,
  };
}

export async function deleteVertex(
  sessionOrTx: Session | Transaction,
  vertexId: string,
  user: Vertex,
) {
  // Check if we received a Session or Transaction
  const isSession = "beginTransaction" in sessionOrTx;
  const tx = isSession
    ? (sessionOrTx as Session).beginTransaction()
    : (sessionOrTx as Transaction);

  try {
    // Check if vertex exists and get its labels
    const vertexCheck = await tx.run(
      `
        MATCH (v)
        WHERE elementId(v) = $id
        RETURN v, labels(v) as labels
      `,
      { id: vertexId },
    );

    if (vertexCheck.records.length === 0) {
      throw new APIError("Vertex not found", 404);
    }

    const deletedVertex = convertNodeToJson(vertexCheck.records[0].get("v"));
    const labels = vertexCheck.records[0].get("labels") as string[];

    // Determine the vertex type from labels
    let vertexType: DeletableVertexType | null = null;
    if (labels.includes("Page")) {
      vertexType = "Page";
    } else if (labels.includes("EmailTemplate")) {
      vertexType = "EmailTemplate";
    } else if (labels.includes("Component")) {
      vertexType = "Component";
    } else if (labels.includes("Function")) {
      vertexType = "Function";
    } else if (labels.includes("Theme")) {
      vertexType = "Theme";
    }

    if (!vertexType) {
      throw new APIError(
        `Vertex is not a Page, EmailTemplate, Component, Function, or Theme. Found labels: ${labels.join(", ")}. Vertex ID: ${vertexId}. Vertex key: ${deletedVertex.P.key || "undefined"}`,
        400,
      );
    }

    // Track deletion counts
    let deletedVertexCount = 0;
    let deletedEdgeCount = 0;
    const deletedVertexIds: string[] = [];
    const deletedEdgeIds: string[] = [];

    const childDeletion = await deleteVertexChildren(tx, vertexId, vertexType);
    deletedVertexCount += childDeletion.deletedVertexCount;
    deletedEdgeCount += childDeletion.deletedEdgeCount;
    deletedVertexIds.push(...childDeletion.deletedVertexIds);
    deletedEdgeIds.push(...childDeletion.deletedEdgeIds);

    // Finally, delete the vertex itself and all its remaining relationships
    const mainVertexResult = await tx.run(
      `
        MATCH (v:${vertexType})
        WHERE elementId(v) = $id
        OPTIONAL MATCH (v)-[r]-()
        WITH v, collect(DISTINCT elementId(r)) as edgeIds
        DETACH DELETE v
        RETURN elementId(v) as deletedNodeId, edgeIds as deletedEdgeIds
      `,
      { id: vertexId },
    );

    if (mainVertexResult.records.length > 0) {
      const record = mainVertexResult.records[0];
      const edgeIds = record.get("deletedEdgeIds");

      // Add the main vertex ID at the end (parent deleted last)
      deletedVertexIds.push(vertexId);
      deletedVertexCount += 1;

      if (edgeIds && edgeIds.length > 0) {
        deletedEdgeIds.push(...edgeIds);
        deletedEdgeCount += edgeIds.length;
      }
    }

    // Log the deletion
    let activityType: string;
    let description: string;

    if (vertexType === "Page") {
      activityType = "page_delete";
      description = `Deleted page: ${deletedVertex.P.title || deletedVertex.P.key} (URL: ${deletedVertex.P.url || "N/A"})`;
    } else if (vertexType === "EmailTemplate") {
      activityType = "email_template_delete";
      description = `Deleted email template: ${deletedVertex.P.name || deletedVertex.P.key}`;
    } else if (vertexType === "Component") {
      activityType = "component_delete";
      description = `Deleted component: ${deletedVertex.P.key || vertexId}`;
    } else if (vertexType === "Theme") {
      activityType = "theme_delete";
      description = `Deleted theme: ${deletedVertex.P.key || vertexId}`;
    } else {
      activityType = "function_delete";
      description = `Deleted function: ${deletedVertex.P.key || vertexId}`;
    }

    await createActivityLog(
      tx,
      activityType,
      vertexType,
      deletedVertex.P.key || vertexId,
      user.P.email,
      description,
    );

    // Only commit if we created the transaction
    if (isSession) {
      await tx.commit();
    }

    console.log(
      `Deleted ${vertexType}: ${deletedVertexCount} vertices, ${deletedEdgeCount} edges`,
    );

    return {
      success: true,
      message: `${vertexType} deleted successfully (${deletedVertexCount} vertices, ${deletedEdgeCount} edges)`,
      deletedVertexCount,
      deletedEdgeCount,
      graph: {
        deleted_vertexes: deletedVertexIds,
        deleted_edges: deletedEdgeIds,
      },
    };
  } catch (error) {
    // Only rollback if we created the transaction
    if (isSession) {
      await tx.rollback();
    }
    throw error;
  }
}
