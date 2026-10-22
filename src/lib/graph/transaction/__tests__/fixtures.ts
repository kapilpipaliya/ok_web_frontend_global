import type { TransactionDetail } from "../types/TransactionDetail";
import type { TransactionValue } from "../types/TransactionType";
import { getDefaultTxnValue } from "../value/getDefaultTxnValue";
import {
  createGraphWithGlobalStore,
  createTxnVertex,
  createVertex,
  type TestGraph,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import type { Vertex } from "~/lib/graph/type/vertex";

export function txnDetail(
  overrides: Partial<TransactionDetail> = {},
): TransactionDetail {
  return {
    ...getDefaultTxnValue(),
    status: "idle",
    lastModified: 0,
    ...overrides,
  };
}

export function mockStep(
  partial: Partial<TransactionValue> & Pick<TransactionValue, "id">,
): TransactionValue {
  const placeholder = createVertex(partial.id, ["Attr"], {});
  return {
    data: placeholder,
    originalData: placeholder,
    ...partial,
  };
}

export function insertStep(vertex: Vertex): TransactionValue {
  return {
    id: vertex.id,
    insert: "insert",
    data: vertex,
    originalData: vertex,
  };
}

export function mergeStep(
  vertexId: string,
  data: Vertex,
  originalData: Vertex,
): TransactionValue {
  return {
    id: vertexId,
    merge: "mergeVertex",
    data,
    originalData,
  };
}

export function graphWithTxn(
  txnId: number,
  txnOverrides: Partial<TransactionDetail> = {},
  extraVertexes: Record<string, Vertex> = {},
): TestGraph {
  return createGraphWithGlobalStore({
    txnId_: txnId,
    extraVertexes: {
      [`txn${txnId}`]: createTxnVertex(txnId, txnOverrides),
      ...extraVertexes,
    },
  });
}
