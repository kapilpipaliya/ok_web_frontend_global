import { type Component, createEffect, For, onCleanup } from "solid-js";

import type { ToasterProps } from "..";
import type { Toast } from "../types";

import { defaultContainerStyle } from "../core";
import { createTimers, store } from "../core";
import { mergeContainerOptions } from "../util";
import { ToastContainer } from ".";

export const Toaster: Component<ToasterProps> = (props) => {
  createEffect(() => {
    mergeContainerOptions(props);
  });

  createEffect(() => {
    const timers = createTimers();
    onCleanup(() => {
      if (!timers) {
        return;
      }
      timers.forEach((timer) => timer && clearTimeout(timer));
    });
  });

  return (
    <div
      class={props.containerClassName}
      style={{
        ...defaultContainerStyle,
        ...props.containerStyle,
      }}
    >
      <style>
        {".sldt-active{z-index:9999;}.sldt-active>*{pointer-events:auto;}"}
      </style>
      <For each={store.toasts}>
        {(toast) => <ToastContainer toast={toast as Toast} />}
      </For>
    </div>
  );
};
