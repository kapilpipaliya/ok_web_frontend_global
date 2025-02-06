import type { JSX, Signal } from "solid-js";

import { createEffect, createSignal } from "solid-js";

import type { OmitAndMerge } from "./types";

export interface DynamicComponent<T extends ValidConstructor> {
  as?: T;
}
export interface DynamicComponentWithRef<T extends ValidConstructor>
  extends WithRef<T> {
  as?: T;
}
export type DynamicNode<T extends ValidConstructor> = T extends ValidElements
  ? UnboxIntrinsicElements<JSX.IntrinsicElements[T]>
  : T extends ValidComponent<infer U>
    ? UnboxComponentProp<U>
    : never;

export type DynamicProps<T extends ValidConstructor> = T extends ValidElements
  ? JSX.IntrinsicElements[T]
  : T extends ValidComponent<infer U>
    ? U
    : Record<string, unknown>;

export type HeadlessProps<T extends ValidConstructor, V = {}> = OmitAndMerge<
  DynamicComponent<T> & V,
  DynamicProps<T>
>;

export type HeadlessPropsWithRef<
  T extends ValidConstructor,
  V = {},
> = OmitAndMerge<DynamicComponentWithRef<T> & V, DynamicProps<T>>;
export type ValidComponent<P> = (props: P) => JSX.Element;

export type ValidConstructor =
  | (string & {})
  | ValidComponent<any>
  | ValidElements;

export type ValidElements = keyof JSX.IntrinsicElements;

// Just a dynamic way to make a `ref` property
// based on the constructor
export interface WithRef<T extends ValidConstructor> {
  ref?: RefField<DynamicNode<T>>;
}

type RefCallback<T> = (el: T) => void;

type RefField<T> = RefCallback<T> | T;

type UnboxComponentProp<U> = U extends { ref: infer X } ? X : never;

type UnboxIntrinsicElements<T> = T extends JSX.HTMLAttributes<infer U>
  ? U
  : never;

// `props.ref` could have been used however it doesn't enforce
// proper timing. We want to make sure that `ref` is called in
// a way that it behaves the same way as if it were called
// natively on an element (which runs in the same scope as the component)
// This is useful if the ref function itself has ownership-based calls
// like createEffect
export function createForwardRef<U extends ValidConstructor>(
  props: WithRef<U>,
): Signal<DynamicNode<U> | undefined> {
  const [ref, setRef] = createSignal<DynamicNode<U>>();

  createEffect(() => {
    const current = ref();
    // Technically Solid compiles refs on components into
    // a function, despite the fact that its type definition
    // says that it is either a function or the ref type
    if (current && "ref" in props && isRefFunction(props.ref)) {
      props.ref(current);
    }
  });

  return [ref, setRef];
}

function isRefFunction<U extends ValidConstructor>(
  callback?: RefField<DynamicNode<U>>,
): callback is RefCallback<DynamicNode<U>> {
  return typeof callback === "function";
}
