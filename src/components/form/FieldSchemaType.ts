import type { Accessor, Owner } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import { UseNavigateResult, useSearch } from "@tanstack/solid-router";

import type {
  PageRenderObject,
  PageRenderStore,
} from "~/features/page_attr_render/context/PageRenderContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { setGraphDataWithTransaction } from "~/lib/graph/mutate/core/setGraphDataWithTransaction";

import type { FormStoreObject } from "./context/FormContext";

export type ComponentNameType = (options: FunctionArgumentType) => string;

export interface FunctionArgumentBaseType {
  data: Vertex;
  dataContext: Record<string | symbol, any>;
  evalExpression: (expression: string, options: object) => any;
  fns?: (name: string) => Function | undefined;
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
  navigate: UseNavigateResult<string>;
  onChange: (value: any) => void;
  owner: Owner;
  parentItems: PageRenderStore[];
  parentMeta: Vertex;
  parentRenderContext: PageRenderObject;
  readOnly: boolean | null | undefined;
  ref: Accessor<HTMLDivElement | null>;
  revertTransaction: (txnId: number) => void;
  revertTransactionUpToIndex: (txnId: number, txnIndex: number) => void;
  runWithOwner: <T>(fn: () => T) => T | undefined;
  runWithParentOwner: <T>(fn: () => T) => T | undefined;
  // setFormValueStore: SetStoreFunction<FormStoreObject>;
  // updateFormValueStore: (data: any, setDirtyFlag?: boolean) => void;
  searchParams?: ReturnType<typeof useSearch>[0];
  setGraph: SetStoreFunction<GraphInterface>;
  setGraphData: (
    txnId: number,
    args: Parameters<typeof setGraphDataWithTransaction>[3],
    options: Parameters<typeof setGraphDataWithTransaction>[4],
  ) => void;
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
  value: any;
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
