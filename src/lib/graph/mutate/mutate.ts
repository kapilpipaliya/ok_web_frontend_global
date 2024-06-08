import { int, type Session } from "neo4j-driver";
import { isObject } from "~/lib/Utils";
import type { Edge, Vertex } from "~/lib/graph/graph";

const txnId = 0;
const vertexIdMap = 1;
const edgeIdMap = 2;
const transactions = 3;

function isProperNodeFormat(node: Partial<Vertex>): string | null {
  if (typeof node !== "object" || node === null || Array.isArray(node)) {
    ("Node must be an object");
  }
  if (!("L" in node) || !Array.isArray(node.L) || node.L.length < 1) {
    return "Node must contain L (labels) which must be an array with at least one item";
  }
  if (node.L.length > 1) {
    return "node L (labels) must be an array and should contain at least  one item.";
  }
  if (node.L.some((label: any) => typeof label !== "string")) {
    return "Each label in node L must be a string";
  }
  if (
    !("P" in node) ||
    typeof node.P !== "object" ||
    node === null ||
    Array.isArray(node.P)
  ) {
    return "Node must have P (properties) which must be an object";
  }
  if (!("id" in node)) {
    return "Node must have an 'id' key";
  }
  return null;
}

function isProperEdgeFormat(edge: Partial<Edge>): string {
  if (typeof edge !== "object" || edge === null || Array.isArray(edge)) {
    return "edge must be an object";
  }
  if (edge.T === undefined || typeof edge.T !== "string") {
    return "edge must contain T (type) and it must be a string.";
  }
  if (edge.S === undefined) {
    //  || typeof edge.S !== "number"
    return "edge must contain S (start) and it must be an integer.";
  }
  if (edge.E === undefined) {
    //  || typeof edge.E !== "number"
    return "edge must contain E (end) and it must be an integer.";
  }
  if (
    edge.P === undefined ||
    typeof edge.P !== "object" ||
    edge.P === null ||
    Array.isArray(edge.P)
  ) {
    return "edge must have P (properties) key and it must be an object";
  }
  if (edge.id === undefined) {
    return "edge must have id key";
  }
  return "";
}

type WsEvent = [number, string, string];

function mutateArgsValidation(event: WsEvent, args: any[]): any {
  const responseResult = [] as any[];

  if (!Array.isArray(args)) {
    return addFailure(
      responseResult,
      event,
      "Invalid argument shape, the argument to sync(mutate) must be an array",
    );
  }

  for (const txns of args) {
    if (!Array.isArray(txns)) {
      return addFailure(
        responseResult,
        event,
        "Invalid argument shape, the inner argument to sync(mutate) must be an array",
      );
    }
    if (txns.length !== 4) {
      return addFailure(
        responseResult,
        event,
        "Invalid argument shape, the inner argument to sync(mutate) must be an array and it should contain 4 elements: first-txnId, second-vertexIdMap, third-EdgeIdMap, fourth-The transactions.",
      );
    }
    if (!Array.isArray(txns[vertexIdMap]) || !Array.isArray(txns[edgeIdMap])) {
      // Assuming these indexes correspond to vertexIdMap and edgeIdMap
      return addFailure(
        responseResult,
        event,
        "Invalid argument shape, the inner argument to sync(mutate) must be an array and it should contain 4 elements. vertexIdMap and EdgeIdMap each item is [num, num] tuple",
      );
    }
    for (const idmap of txns[vertexIdMap]) {
      if (
        idmap.length !== 2
        // typeof idmap[0] !== "number" ||
        // typeof idmap[1] !== "number"
      ) {
        return addFailure(
          responseResult,
          event,
          "Invalid argument shape, vertexIdMap and EdgeIdMap each item is [num, num] tuple",
        );
      }
    }
    for (const idmap of txns[edgeIdMap]) {
      if (
        idmap.length !== 2
        // typeof idmap[0] !== "number" ||
        // typeof idmap[1] !== "number"
      ) {
        return addFailure(
          responseResult,
          event,
          "Invalid argument shape, vertexIdMap and EdgeIdMap each item is [num, num] tuple",
        );
      }
    }
    for (const mutationObject of txns[transactions]) {
      const mutationTypes = ["insert", "replace", "merge", "deleteVertex"];
      const edgeMutationTypes = [
        "insertEdge",
        "replaceEdge",
        "replaceEdgeStart",
        "replaceEdgeEnd",
        "deleteEdge",
      ];

      for (const key of mutationTypes) {
        if (key in mutationObject && !isObject(mutationObject[key])) {
          return addFailure(
            responseResult,
            event,
            `${key} shape must be an object`,
          );
        }
        if (key in mutationObject) {
          const err = isProperNodeFormat(mutationObject[key]);
          if (err) {
            return addFailure(responseResult, event, `${key} ${err}`);
          }
        }
      }
      for (const key of edgeMutationTypes) {
        if (key in mutationObject && !isObject(mutationObject[key])) {
          return addFailure(
            responseResult,
            event,
            `${key} shape must be an object`,
          );
        }
        if (key in mutationObject) {
          const err = isProperEdgeFormat(mutationObject[key]);
          if (err) {
            return addFailure(responseResult, event, `${key} ${err}`);
          }
        }
      }
    }
  }

  return responseResult;
}

function addFailure(response: any[], event: WsEvent, message: string) {
  response.push([event, { error: true, description: message }]);
}

export async function mutateData(
  event: WsEvent,
  args: any[],
  session: Session,
): Promise<any> {
  const tx = session.beginTransaction();
  const clientToServerVertexIdMap = new Map<number, number>();
  const clientToServerEdgeIdMap = new Map<number, number>();
  const responseResult = [] as any[];
  console.log(args)
  const validationResult = mutateArgsValidation(event, args);
  if (!validationResult) {
    return {error: true, message: 'Invalid argument shape'};
  }
  if (Object.keys(validationResult).length > 0) {
    return validationResult;
  }

  const resultTxn = [] as any[];

  for (const txns of args) {
    for (const [oldId, newId] of txns[vertexIdMap]) {
      clientToServerVertexIdMap.set(oldId, newId);
    }
    for (const [oldId, newId] of txns[edgeIdMap]) {
      clientToServerEdgeIdMap.set(oldId, newId);
    }

    const txnResult = [] as any[];
    for (const mutationObject of txns[transactions]) {
      if (mutationObject.insert && isObject(mutationObject.insert)) {
        // check if current user has permission to insert, if not return error.
        // most of the time, it will be checked before in the client side
        // display proper error in modal in frontend

        // also check user has permissions to insert all properties.
        // if not all properties are allowed, do not save and return error.
        // only save the properties that are allowed and ignore remaining properties.

        const labels = mutationObject.insert.L.map(
          (label: string) => `:${label}`,
        ).join("");

        const query = `CREATE (n${labels} $properties) SET n.createdAt = localDateTime() RETURN n`;

        try {
          const result = await tx.run(query, {
            properties: mutationObject.insert.P,
          });
          if (result.records.length > 0) {
            const id = result.records[0].get("n").elementId;
            const oldId = mutationObject.insert.id;
            clientToServerVertexIdMap.set(oldId, id);
            txnResult.push({ insert: [oldId, id] });
          }
        } catch (error) {
          tx.rollback();
          console.error("Failed to execute insert query:", error);
          throw new Error(
            `Can't insert due to an internal server error: ${error}`,
          );
        }
      }
      if (mutationObject.replace && isObject(mutationObject.replace)) {
        let id = mutationObject.replace.id;
        if (clientToServerVertexIdMap.has(id)) {
          id = clientToServerVertexIdMap.get(id);
        }

        const query =
          "MATCH (n) WHERE id(n) = $id SET n = $properties SET n.updatedAt = localDateTime() RETURN n";
        try {
          const result = await tx.run(query, {
            id: int(id),
            properties: mutationObject.replace.P,
          });
          if (result.records.length > 0) {
            txnResult.push({ replace: { id, error: false } });
          }
        } catch (error: any) {
          tx.rollback();
          console.error("Failed to execute replace query:", error);
          throw new Error(
            `Can't replace due to an internal server error: ${error.message}`,
          );
        }
      }
      if (mutationObject.merge && isObject(mutationObject.merge)) {
        let id = mutationObject.merge.id;
        if (clientToServerVertexIdMap.has(id)) {
          id = clientToServerVertexIdMap.get(id);
        }

        const query =
          "MATCH (n) WHERE id(n) = $id SET n += $properties, n.updatedAt = localDateTime() RETURN n";
        try {
          const result = await tx.run(query, {
            id: int(id),
            properties: mutationObject.merge.P,
          });
          if (result.records.length > 0) {
            txnResult.push({ merge: { id, error: false } });
          }
        } catch (error: any) {
          tx.rollback();
          console.error("Failed to execute merge query:", error);
          throw new Error(
            `Can't merge due to an internal server error: ${error.message}`,
          );
        }
      }

      if (mutationObject.deleteVertex) {
        const id =
          clientToServerVertexIdMap.get(mutationObject.deleteVertex.id) ||
          mutationObject.deleteVertex.id;

        const query = "MATCH (n) WHERE id(n) = $id DELETE n";

        try {
          await tx.run(query, { id: int(id) });

          txnResult.push({ deleteVertex: { id, error: false } });
        } catch (error: any) {
          console.error("Failed to execute delete vertex query:", error);
          throw new Error(
            `Can't delete vertex due to an internal server error: ${error.message}`,
          );
        }
      }

      if (mutationObject.insertEdge) {
        // if user has no permission to insert row vertex, do not allow and return error.
        // if user has no permission to insert select, dont allow it.
        //
        const startId =
          clientToServerVertexIdMap.get(mutationObject.insertEdge.S) ||
          mutationObject.insertEdge.S;
        const endId =
          clientToServerVertexIdMap.get(mutationObject.insertEdge.E) ||
          mutationObject.insertEdge.E;

        const type = mutationObject.insertEdge.T;
        const query = `match (n1) where id(n1)=$startId
              match (n2) where id(n2)=$endId
              merge (n1)-[r:${type}]->(n2)
              SET r += $properties
              SET r.updatedAt = localDateTime()
              return r`;

        try {
          const result = await tx.run(query, {
            startId: int(startId),
            endId: int(endId),
            properties: mutationObject.insertEdge.P,
          });
          if (result.records.length > 0) {
            const oldId = mutationObject.insertEdge.id;
            const edgeId = result.records[0].get("r").elementId;
            clientToServerEdgeIdMap.set(oldId, edgeId);

            txnResult.push({ insertEdge: [oldId, edgeId] });
          }
        } catch (error) {
          tx.rollback();
          console.error("Failed to execute insert edge query:", error);
          throw new Error(
            `Can't insert edge due to an internal server error: ${error}`,
          );
        }
      }

      if (mutationObject.replaceEdge) {
        const id =
          clientToServerEdgeIdMap.get(mutationObject.replaceEdge.id) ||
          mutationObject.replaceEdge.id;
        const startId =
          clientToServerVertexIdMap.get(mutationObject.replaceEdge.S) ||
          mutationObject.replaceEdge.S;
        const endId =
          clientToServerVertexIdMap.get(mutationObject.replaceEdge.E) ||
          mutationObject.replaceEdge.E;

        const type = mutationObject.replaceEdge.T;
        const query = `match (n1) where id(n1)=$startId
              match (n2) where id(n2)=$endId
              match (n1)-[r:${type}]->(n2)
              where id(r) = $id
              set r = $properties
              SET r.updatedAt = localDateTime()
              return r`;

        try {
          const result = await tx.run(query, {
            id: int(id),
            startId: int(startId),
            endId: int(endId),
            properties: mutationObject.replaceEdge.P,
          });
          if (result.records.length > 0) {
            const oldId = mutationObject.replaceEdge.id;
            const edgeId = result.records[0].get("r").elementId;
            clientToServerEdgeIdMap.set(oldId, edgeId);

            txnResult.push({ replaceEdge: [oldId, edgeId] });
          }
        } catch (error: any) {
          tx.rollback();
          console.error("Failed to execute replac edge query:", error);
          throw new Error(
            `Can't replac edge due to an internal server error: ${error.message}`,
          );
        }
      }

      if (mutationObject.replaceEdgeStart) {
        const id =
          clientToServerEdgeIdMap.get(mutationObject.replaceEdgeStart.id) ||
          mutationObject.replaceEdgeStart.id;
        const startId =
          clientToServerVertexIdMap.get(mutationObject.replaceEdgeStart.S) ||
          mutationObject.replaceEdgeStart.S;
        const endId =
          clientToServerVertexIdMap.get(mutationObject.replaceEdgeStart.E) ||
          mutationObject.replaceEdgeStart.E;

        const type = mutationObject.replaceEdgeStart.T;
        const query = `match ()-[r:${type}]->()
                    WHERE id(r) = $edgeId 
                    match (s) where id(s) = $newstart 
                    match (e) where id(e) = id(endNode(r)) 
                    create (s)-[t:${type}]->(e)
                    set t = properties(r)
                    SET t.updatedAt = localDateTime()
                    delete r
                    return t`;

        try {
          const result = await tx.run(query, {
            edgeId: int(id),
            newstart: int(startId),
          });
          if (result.records.length > 0) {
            const oldId = mutationObject.replaceEdgeStart.id;
            const edgeId = result.records[0].get("r").elementId;
            clientToServerEdgeIdMap.set(oldId, edgeId);

            txnResult.push({ replaceEdgeStart: { error: false } });
          }
        } catch (error) {
          tx.rollback();
          console.error("Failed to execute replac edge start query:", error);
          throw new Error(
            `Can't replac edge start due to an internal server error: ${error}`,
          );
        }
      }

      if (mutationObject.replaceEdgeEnd) {
        const id =
          clientToServerEdgeIdMap.get(mutationObject.replaceEdgeEnd.id) ||
          mutationObject.replaceEdgeEnd.id;
        const startId =
          clientToServerVertexIdMap.get(mutationObject.replaceEdgeEnd.S) ||
          mutationObject.replaceEdgeEnd.S;
        const endId =
          clientToServerVertexIdMap.get(mutationObject.replaceEdgeEnd.E) ||
          mutationObject.replaceEdgeEnd.E;

        const type = mutationObject.replaceEdgeEnd.T;
        const query = `match ()-[r:${type}]->()
                    WHERE id(r) = $edgeId
                    match (s) where id(s) = id(startNode(r)) 
                    match (e) where id(e) = $newend 
                    create (s)-[t:${type}]->(e)
                    set t = properties(r)
                    SET t.updatedAt = localDateTime()
                    delete r
                    return t`;

        try {
          const result = await tx.run(query, {
            edgeId: int(id),
            newend: int(endId),
          });
          if (result.records.length > 0) {
            const oldId = mutationObject.replaceEdgeEnd.id;
            const edgeId = result.records[0].get("r").elementId;
            clientToServerEdgeIdMap.set(oldId, edgeId);

            txnResult.push({ replaceEdgeEnd: { error: false } });
          }
        } catch (error) {
          tx.rollback();
          console.error("Failed to execute replac edge end query:", error);
          throw new Error(
            `Can't replac edge end due to an internal server error: ${error}`,
          );
        }
      }

      if (mutationObject.deleteEdge) {
        console.log('deleteEDge')
        const id =
          clientToServerEdgeIdMap.get(mutationObject.deleteEdge.id) ||
          mutationObject.deleteEdge.id;
        const startId =
          clientToServerVertexIdMap.get(mutationObject.deleteEdge.S) ||
          mutationObject.deleteEdge.S;
        const endId =
          clientToServerVertexIdMap.get(mutationObject.deleteEdge.E) ||
          mutationObject.deleteEdge.E;

        const type = mutationObject.deleteEdge.T;
        const query = `match (n1)-[r:${type}]->(n2)
                    where id(n1) = $startId and id(n2) = $endId and id(r) = $id 
                    delete r;`;

        try {
          const result = await tx.run(query, {
            id: int(id),
            startId: int(startId),
            endId: int(endId),
          });
          if (result.records.length > 0) {
            const oldId = mutationObject.deleteEdge.id;
            const edgeId = result.records[0].get("r").elementId;
            clientToServerEdgeIdMap.set(oldId, edgeId);

            txnResult.push({ deleteEdge: { error: false } });
          }
        } catch (error) {
          tx.rollback();
          console.error("Failed to execute replac edge delete query:", error);
          throw new Error(
            `Can't delete edge end due to an internal server error: ${error}`,
          );
        }
      }
    }
    resultTxn.push([txns[txnId], txnResult]);
    tx.commit();
  }

  // Transaction close will close session too.
  // await tx.close();
  responseResult.push([event, resultTxn]);
  return responseResult;
}
