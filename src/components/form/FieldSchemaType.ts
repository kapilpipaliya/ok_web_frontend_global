
import type { Accessor, Owner } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import type { PageRenderObject, PageRenderStore } from "../page_attr_render/context/PageRenderContext";
import type { FormStoreObject } from "./context/FormContext";
import { SetStoreFunction } from "solid-js/store";

export interface RegexValidation {
  enabled: boolean;
  message: string;
  value: string;
}

export type RequiredFnType =
  | ((formStore: FormStoreObject) => boolean)
  | boolean;

export type HiddenFnType =
  | ((options: FunctionArgumentType) => boolean)
  | boolean;

export interface FunctionArgumentBaseType {
  data: Vertex;
  evalExpression: (expression: string, options: object) => any;
  hasDeletePermission: boolean | null | undefined;
  hasEditPermission: boolean | null | undefined;
  hasInsertPermission: boolean | null | undefined;
  hasViewPermission: boolean | null | undefined;
  isNoPermissionCheck: boolean | null | undefined;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  isViewMode: boolean | null | undefined;
  // formInitialValues: FormStoreObject;
  // formValueStore: FormStoreObject;
  meta: Vertex;
  mounted: Accessor<boolean>;
  onChange: (value: any) => void;
  owner: Owner;
  parentItems: PageRenderStore[];
  parentMeta: Vertex;
  parentRenderContext: PageRenderObject;
  readOnly: boolean | null | undefined;
  ref: Accessor<HTMLDivElement | null>;
  dataContext: Record<string | symbol, any>;
  fns: (name: string) => Function | undefined;
  runWithOwner: <T>(fn: () => T) => T | undefined;
  runWithParentOwner: <T>(fn: () => T) => T | undefined;
  // setFormValueStore: SetStoreFunction<FormStoreObject>;
  // updateFormValueStore: (data: any, setDirtyFlag?: boolean) => void;
  zIndex: number;
  txnId: number;
}

export interface FunctionArgumentType extends FunctionArgumentBaseType {
  // parentValue: any;
  // projections: (number | string)[];
  value: any;
}

export type ComponentNameType = (options: FunctionArgumentType) => string;
