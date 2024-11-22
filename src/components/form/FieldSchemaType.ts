import type { OffsetOptions, Placement } from "@floating-ui/dom";
import type { Accessor, JSXElement, Owner } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "./FormContext";
import { Vertex } from "~/lib/graph/graph";
import { RenderStore } from "../css_properties/context/RenderContext";
import { PageRenderStore } from "../page_attr_render/context/PageRenderContext";


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
  isViewMode: boolean | null | undefined;
  // formInitialValues: FormStoreObject;
  // formValueStore: FormStoreObject;
  meta: Vertex;
  mounted: Accessor<boolean>;
  onChange: (value: any) => void;
  owner: Owner;
  parentItems: PageRenderStore[];
  parentMeta: Vertex;
  readOnly: boolean | null | undefined;
  ref: Accessor<HTMLDivElement | null>;
  repeaterContext: Record<string | symbol, any>;
  runWithOwner: <T>(fn: () => T) => T | undefined;
  runWithParentOwner: <T>(fn: () => T) => T | undefined;
  // setFormValueStore: SetStoreFunction<FormStoreObject>;
  // updateFormValueStore: (data: any, setDirtyFlag?: boolean) => void;
  zIndex: number;
}

export interface FunctionArgumentType extends FunctionArgumentBaseType {
  // parentValue: any;
  // projections: (number | string)[];
  value: any;
}

export type ComponentNameType = (options: FunctionArgumentType) => string;
