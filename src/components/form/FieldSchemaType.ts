import type { OffsetOptions, Placement } from "@floating-ui/dom";
import type { Accessor, JSXElement, Owner } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "./FormContext";
import { Vertex } from "~/lib/graph/graph";
import { RenderStore } from "../css_properties/RenderContext";


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
  // formInitialValues: FormStoreObject;
  // formValueStore: FormStoreObject;
  meta: Vertex;
  mounted: Accessor<boolean>;
  onChange: (value: any) => void;
  owner: Owner;
  parentItems: [] | RenderStore[];
  parentMeta: Vertex;
  ref: Accessor<HTMLDivElement | null>;
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
