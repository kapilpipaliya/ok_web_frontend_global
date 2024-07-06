import { klona } from "klona";
import { describe, expect, test } from "vitest";

import { graph } from "../../graph";
import { transactions } from "../../transaction/TransactionType";
import {
  addNewEdge,
  deleteEdge,
  newEdge,
  replaceEdgeEnd,
  replaceEdgeProperties,
  replaceEdgeStart,
} from "../edge";
import { addNewVertex, newVertex } from "../vertex";

describe("addNewEdge", () => {
  beforeEach(() => {
    transactions.clear();
  });
  test("modifying Edge dont change store", async () => {
    // in solid when we set an object to the store, we can mutate store with original object reference
    // to prevent accidental behaviour we clone the object.
    const vertex1 = newVertex(graph.newVertexId, ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const vertex2 = newVertex(graph.newVertexId, ["hello"], {
      a: 6,
      b: 7,
      c: [8, 9, 10],
    });
    const { error, txnDetailIndex } = addNewVertex(1, vertex1);
    expect(error).toBe(false);
    expect(txnDetailIndex).toBe(0);
    const { error: error1, txnDetailIndex: txnDetailIndex1 } = addNewVertex(
      1,
      vertex2,
    );
    expect(error1).toBe(false);
    expect(txnDetailIndex1).toBe(1);
    const Edge1 = newEdge(
      graph.newVertexId,
      "hello",
      { a: 11, b: 12, c: [13, 14, 15] },
      vertex1.id,
      vertex2.id,
    );
    addNewEdge(1, Edge1);
    Edge1.P.a = 3;
    expect(graph.edges[Edge1.id].P.a).to.eq(11);
  });
  test("Edge revert transaction", async () => {
    const vertex1 = newVertex(graph.newVertexId, ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const vertex2 = newVertex(graph.newVertexId, ["hello"], {
      a: 6,
      b: 7,
      c: [8, 9, 10],
    });
    const { error, txnDetailIndex } = addNewVertex(1, vertex1);
    expect(error).toBe(false);
    expect(txnDetailIndex).toBe(0);
    const { error: error1, txnDetailIndex: txnDetailIndex1 } = addNewVertex(
      1,
      vertex2,
    );
    expect(error1).toBe(false);
    expect(txnDetailIndex1).toBe(1);
    const initialStore = klona(graph);
    const Edge1 = newEdge(
      graph.newVertexId,
      "hello",
      { a: 11, b: 12, c: [13, 14, 15] },
      vertex1.id,
      vertex2.id,
    );
    // @ts-ignore
    const { error: error2, txnDetailIndex: txnDetailIndex2 } = addNewEdge(
      1,
      Edge1,
    );
    const txnDetails = transactions.get(1)!;
    txnDetails.steps[txnDetailIndex2!].revert();
    expect(graph).toEqual(initialStore);
  });
});

describe("replaceEdgeProperties", () => {
  beforeEach(() => {
    transactions.clear();
  });
  test("modifying properties dont change store", async () => {
    const vertex1 = newVertex(graph.newVertexId, ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const vertex2 = newVertex(graph.newVertexId, ["hello"], {
      a: 6,
      b: 7,
      c: [8, 9, 10],
    });
    const { error, txnDetailIndex } = addNewVertex(1, vertex1);
    expect(error).toBe(false);
    expect(txnDetailIndex).toBe(0);
    const { error: error1, txnDetailIndex: txnDetailIndex1 } = addNewVertex(
      1,
      vertex2,
    );
    expect(error1).toBe(false);
    expect(txnDetailIndex1).toBe(1);
    const Edge1 = newEdge(
      graph.newVertexId,
      "hello",
      { a: 11, b: 12, c: [13, 14, 15] },
      vertex1.id,
      vertex2.id,
    );
    //@ts-ignore
    const { error: error2, txnDetailIndex: txnDetailIndex2 } = addNewEdge(
      1,
      Edge1,
    );
    const newProperties = { a: 13, d: 14 };
    //@ts-ignore
    const { error: error3, txnDetailIndex: txnDetailIndex3 } =
      replaceEdgeProperties(1, Edge1.id, newProperties);
    expect(graph.edges[Edge1.id].P.a).to.eq(13);
    newProperties.a = 1;
    expect(graph.edges[Edge1.id].P.a).to.eq(13);
  });

  test("Edge revert replace Properties", async () => {
    const vertex1 = newVertex(graph.newVertexId, ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const vertex2 = newVertex(graph.newVertexId, ["hello"], {
      a: 6,
      b: 7,
      c: [8, 9, 10],
    });
    const { error, txnDetailIndex } = addNewVertex(1, vertex1);
    expect(error).toBe(false);
    expect(txnDetailIndex).toBe(0);
    const { error: error1, txnDetailIndex: txnDetailIndex1 } = addNewVertex(
      1,
      vertex2,
    );
    expect(error1).toBe(false);
    expect(txnDetailIndex1).toBe(1);
    const Edge1 = newEdge(
      graph.newVertexId,
      "hello",
      { a: 11, b: 12, c: [13, 14, 15] },
      vertex1.id,
      vertex2.id,
    );
    //@ts-ignore
    const { error: error2, txnDetailIndex: txnDetailIndex2 } = addNewEdge(
      1,
      Edge1,
    );
    const initialStore = klona(graph);
    const newProperties = { a: 6, d: 7 };
    //@ts-ignore
    const { error: error3, txnDetailIndex: txnDetailIndex3 } =
      replaceEdgeProperties(1, Edge1.id, newProperties);
    const txnDetails = transactions.get(1)!;
    txnDetails.steps[txnDetailIndex3!].revert();
    expect(graph).toEqual(initialStore);
  });
});

describe("updateEdgeStartAndEnd Test", () => {
  beforeEach(() => {
    transactions.clear();
  });
  test("Edge revert replace Properties", async () => {
    const vertex1 = newVertex(graph.newVertexId, ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const vertex2 = newVertex(graph.newVertexId, ["hello"], {
      a: 6,
      b: 7,
      c: [8, 9, 10],
    });
    const vertex3 = newVertex(graph.newVertexId, ["hello"], {
      a: 11,
      b: 12,
      c: [13, 14, 15],
    });
    const { error, txnDetailIndex } = addNewVertex(1, vertex1);
    expect(error).toBe(false);
    expect(txnDetailIndex).toBe(0);
    const { error: error1, txnDetailIndex: txnDetailIndex1 } = addNewVertex(
      1,
      vertex2,
    );
    expect(error1).toBe(false);
    expect(txnDetailIndex1).toBe(1);
    const { error: error2, txnDetailIndex: txnDetailIndex2 } = addNewVertex(
      1,
      vertex3,
    );
    expect(error2).toBe(false);
    expect(txnDetailIndex2).toBe(2);
    const Edge1 = newEdge(
      graph.newVertexId,
      "hello",
      { a: 16, b: 17, c: [18, 19, 20] },
      vertex1.id,
      vertex2.id,
    );
    const Edge2 = newEdge(
      graph.newVertexId,
      "hello",
      { a: 16, b: 17, c: [18, 19, 20] },
      vertex1.id,
      vertex3.id,
    );
    //@ts-ignore
    const { error: error3, txnDetailIndex: txnDetailIndex3 } = addNewEdge(
      1,
      Edge1,
    );
    //@ts-ignore
    const { error: error4, txnDetailIndex: txnDetailIndex4 } = addNewEdge(
      1,
      Edge2,
    );
    const initialStore = klona(graph);
    //@ts-ignore
    const { error: error5, txnDetailIndex: txnDetailIndex5 } = replaceEdgeStart(
      1,
      Edge2.id,
      vertex2.id,
    );
    //@ts-ignore
    const { error: error6, txnDetailIndex: txnDetailIndex6 } = replaceEdgeEnd(
      1,
      Edge2.id,
      vertex1.id,
    );
    const txnDetails = transactions.get(1)!;
    txnDetails.steps[txnDetailIndex5!].revert();
    txnDetails.steps[txnDetailIndex6!].revert();
    expect(JSON.parse(JSON.stringify(graph))).toEqual(initialStore);
  });
});

describe("deleteEdge", () => {
  beforeEach(() => {
    transactions.clear();
  });
  test("vertex revert transaction", async () => {
    const vertex1 = newVertex(graph.newVertexId, ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const vertex2 = newVertex(graph.newVertexId, ["hello"], {
      a: 6,
      b: 7,
      c: [8, 9, 10],
    });
    const { error, txnDetailIndex } = addNewVertex(1, vertex1);
    expect(error).toBe(false);
    expect(txnDetailIndex).toBe(0);
    const { error: error1, txnDetailIndex: txnDetailIndex1 } = addNewVertex(
      1,
      vertex2,
    );
    expect(error1).toBe(false);
    expect(txnDetailIndex1).toBe(1);
    const Edge1 = newEdge(
      graph.newVertexId,
      "hello",
      { a: 11, b: 12, c: [13, 14, 15] },
      vertex1.id,
      vertex2.id,
    );
    //@ts-ignore
    const { error: error2, txnDetailIndex: txnDetailIndex2 } = addNewEdge(
      1,
      Edge1,
    );
    const initialStore = klona(graph);
    //@ts-ignore
    const { error: error3, txnDetailIndex: txnDetailIndex3 } = deleteEdge(
      1,
      Edge1.id,
    );
    const txnDetails = transactions.get(1)!;
    txnDetails.steps[txnDetailIndex3!].revert();
    expect(graph).toEqual(initialStore);
  });
});
