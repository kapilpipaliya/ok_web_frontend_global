import neo4j from 'neo4j-driver';
import {Node, Relationship} from "../lib/graph";
import {DBConnection} from "../lib/dbs";

export async function getOutEdges(dbConn: DBConnection, fromId: number | string | any, type: string, options: {
  isInward?: boolean
} = {})  {
  dbConn.session ||= dbConn.driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    // Cypher query to create a new vertex
    const matchVertexQuery = `MATCH (sourceNode)${options.isInward ? '<-': '-'}[relationshipType${type ? `:${type}` : ''}]${options.isInward ? '-' : '->'}(targetNode)
WHERE id(sourceNode) = $fromId
RETURN targetNode, relationshipType
`;
    const vertexResult = await dbConn.session.run(matchVertexQuery, { fromId });

    const resultNodes = [] as [Relationship, Node][];
    for (const record of vertexResult.records) {
      const targetNode  = record.get('targetNode') as Node;
      targetNode.id = targetNode.identity!;
      targetNode.P = targetNode.properties!;
      targetNode.L = targetNode.labels!;

      const targetRelationship = record.get('relationshipType') as Relationship;
      targetRelationship.id = targetRelationship.identity!;
      targetRelationship.P = targetRelationship.properties!;
      targetRelationship.T = targetRelationship.type!;
      targetRelationship.S = targetRelationship.start!;
      targetRelationship.E = targetRelationship.end!;
      resultNodes.push([targetRelationship, targetNode]);
    }
    return {
      error: false,
      pairs: resultNodes,
    };
  } catch (error) {
    console.error(error);

    return { error: true, message: 'An error occurred' };
  } finally {
    // await session.close();
    // on application exit:
    // await driver.close();
  }
}
