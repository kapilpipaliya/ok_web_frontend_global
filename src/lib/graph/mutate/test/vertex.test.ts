import { describe, expect, test } from "vitest";
import { graph } from "../../graph";
import { getNewGraphId, transactions } from "../../transaction";
import { klona } from "klona";
import {
  addNewVertex,
  deleteVertex,
  newVertex,
  replaceVertexProperties,
} from "../vertex";

describe("addNewVertex", () => {
  beforeEach(() => {
    transactions.clear();
  });
  test("modifying vertex dont change store", async () => {
    // in solid when we set an object to the store, we can mutate store with original object reference
    // to prevent accidental behaviour we clone the object.
    const vertex1 = newVertex(getNewGraphId(), ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    addNewVertex(1, vertex1);
    vertex1.P.a = 3;
    expect(graph.vertexes[vertex1.id].P.a).to.eq(1);
  });

  test("vertex revert transaction", async () => {
    const vertex1 = newVertex(getNewGraphId(), ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const vertex2 = newVertex(getNewGraphId(), ["hello"], {
      a: 6,
      b: 7,
      c: [8, 9, 10],
    });
    const { error, txnDetailIndex } = addNewVertex(1, vertex1);
    expect(error).toBe(false);
    expect(txnDetailIndex).toBe(0);
    const initialStore = klona(graph);
    const { error: error1, txnDetailIndex: txnDetailIndex1 } = addNewVertex(
      1,
      vertex2,
    );
    expect(error1).toBe(false);
    expect(txnDetailIndex1).toBe(1);
    const txnDetails = transactions.get(1)!;
    expect(txnDetails.steps.map((txn) => txn.insert!())).toEqual([
      klona(vertex1),
      klona(vertex2),
    ]);
    txnDetails.steps[txnDetailIndex1!].revert();
    expect(graph).toEqual(initialStore);
  });
});
describe("replaceVertexProperties", () => {
  beforeEach(() => {
    transactions.clear();
  });
  test("modifying properties dont change store", async () => {
    const vertex1 = newVertex(getNewGraphId(), ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const { error, txnDetailIndex } = addNewVertex(1, vertex1);
    expect(error).toBe(false);
    expect(txnDetailIndex).toBe(0);
    const newProperties = { a: 6, d: 7 };
    replaceVertexProperties(1, vertex1.id, newProperties);
    expect(graph.vertexes[vertex1.id].P.a).to.eq(6);
    newProperties.a = 1;
    expect(graph.vertexes[vertex1.id].P.a).to.eq(6);
  });

  test("vertex revert replace Properties", async () => {
    const vertex1 = newVertex(getNewGraphId(), ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const vertex2 = newVertex(getNewGraphId(), ["hello"], {
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
    const newProperties = { a: 6, d: 7 };
    // @ts-ignore
    const { error: error2, txnDetailIndex: txnDetailIndex2 } =
      replaceVertexProperties(1, vertex1.id, newProperties);
    const reverts = transactions.get(1)!;
    reverts.steps[txnDetailIndex2!].revert();
    expect(graph).toEqual(initialStore);
  });
});

describe("deleteVertex", () => {
  beforeEach(() => {
    transactions.clear();
  });
  test("modifying properties dont change store", async () => {
    const vertex1 = newVertex(getNewGraphId(), ["hello"], {
      a: 1,
      b: 2,
      c: [3, 4, 5],
    });
    const vertex2 = newVertex(getNewGraphId(), ["hello"], {
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
    // @ts-ignore
    const { error: error2, txnDetailIndex: txnDetailIndex2 } = deleteVertex(
      1,
      vertex2.id,
    );
    const reverts = transactions.get(1)!;
    reverts.steps[txnDetailIndex2!].revert();
    expect(graph).toEqual(initialStore);
  });
});
