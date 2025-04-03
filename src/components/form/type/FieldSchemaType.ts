import type { useNavigate, useSearchParams } from "@solidjs/router";
import type { Accessor, Owner } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { GraphData } from "~/cypher/types/ServerResult";
import type {
  PageRenderObject,
  PageRenderStore,
} from "~/features/page_attr_render/context/PageRenderContext";
import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";
import type { UpdateOptions } from "~/lib/graph/mutate/core/setGraphData";

import type { FormStoreObject } from "../context/FormContext";

export interface FunctionArgumentBaseType {
  clearAllErrors: () => void;
  componentName: string;
  data: Vertex;
  dataContext: Record<string | symbol, unknown>;
  deleteTxnIdAndCreateNew: (txnId: number) => number;
  ensureData: () => null | string;
  error: (key?: string) => string | undefined;
  evalExpression: (expression: string, options: object) => unknown;
  fns: Record<string, ((...args: unknown[]) => unknown) | undefined>;
  graph: GraphInterface;
  hasDeletePermission: boolean | null | undefined;
  hasEditPermission: boolean | null | undefined;
  hasInsertPermission: boolean | null | undefined;
  hasViewPermission: boolean | null | undefined;
  isNoPermissionCheck: boolean | null | undefined;
  isViewMode: boolean | null | undefined;
  // formInitialValues: FormStoreObject;
  // formValueStore: FormStoreObject;
  meta: Vertex;
  mounted: Accessor<boolean>;
  navigate: ReturnType<typeof useNavigate>;
  onChange: (value: unknown) => void;
  owner: Owner;
  parentItems: PageRenderStore[];
  parentMeta: Vertex;
  parentRenderContext: PageRenderObject;
  readOnly: boolean | null | undefined;
  ref: Accessor<HTMLDivElement | null>;
  removeTxnIdAndCreateNew: (txnId: number) => number;
  revertTransaction: (txnId: number) => void;
  revertTransactionUpToIndex: (txnId: number, txnIndex: number) => void;
  runWithOwner: <T>(fn: () => T) => T | undefined;
  runWithParentOwner: <T>(fn: () => T) => T | undefined;
  // setFormValueStore: SetStoreFunction<FormStoreObject>;
  // updateFormValueStore: (data: any, setDirtyFlag?: boolean) => void;
  searchParams?: ReturnType<typeof useSearchParams>[0];
  setError: (error: string | undefined, key?: string) => void;
  setGraph: SetStoreFunction<GraphInterface>;
  setGraphData: (
    txnId: number,
    args: GraphData,
    options: UpdateOptions,
  ) => void;
  setSearchParams?: ReturnType<typeof useSearchParams>[1];
  showErrorToast: (message: string) => void;
  showSuccessToast: (message: string) => void;
  showWarningToast: (message: string) => void;
  txnId: number;
  updateValue: (value: unknown) => void;
  zIndex: number;
}

export interface FunctionArgumentType extends FunctionArgumentBaseType {
  // parentValue: any;
  // projections: (number | string)[];
  value: unknown;
}

export type HiddenFnType =
  | ((options: FunctionArgumentType) => boolean)
  | boolean;

export interface RegexValidation {
  enabled: boolean;
  message: string;
  value: string;
}

export type RequiredFnType =
  | ((formStore: FormStoreObject) => boolean)
  | boolean;
