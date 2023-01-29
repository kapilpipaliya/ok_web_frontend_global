// converted from https://github.com/haoxins/react-flatpickr/blob/master/lib/index.js
import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import { BaseOptions, DateOption, Hook, Options } from "flatpickr/dist/types/options";
import { createEffect, onCleanup } from "solid-js";
import "flatpickr/dist/flatpickr.min.css";

import { Label } from "./Label";

type CallbackPropTypes = (instance: Instance) => void;

interface Properties {
  options?: { wrap?: boolean };
  onChange?: Hook | Hook[];
  onOpen?: Hook | Hook[];
  onClose?: Hook | Hook[];
  onMonthChange?: Hook | Hook[];
  onYearChange?: Hook | Hook[];
  onReady?: Hook | Hook[];
  onValueUpdate?: Hook | Hook[];
  onDayCreate?: Hook | Hook[];
  onCreate?: CallbackPropTypes;
  onDestroy?: CallbackPropTypes;
  value: DateOption | DateOption[];
  children?: HTMLElement;
  className?: string;

  label?: string;
  disabled?: boolean;
  dateFormat?: string;
  error?: string;
  required?: boolean;
}

export const DateTimePicker = (props: Properties) => {
  //const hooks = ['onChange', 'onOpen', 'onClose', 'onMonthChange', 'onYearChange', 'onReady', 'onValueUpdate', 'onDayCreate'];
  //const callbacks = ['onCreate', 'onDestroy'];
  let flatpickrNode: HTMLElement | HTMLInputElement | null;
  let flatpickrInst: Instance;
  const destroyFlatpickrInstance = () => {
    if (flatpickrInst) {
      const { onDestroy } = props;
      if (onDestroy) onDestroy(flatpickrInst);
      flatpickrInst.destroy();
      flatpickrNode = null;
    }
  };

  onCleanup(() => {
    destroyFlatpickrInstance();
  });

  const createFlatpickrInstance = () => {
    if (flatpickrNode) {
      const optionsNew: Partial<BaseOptions> = {
        onClose: () => {
          flatpickrNode && flatpickrNode.blur && flatpickrNode.blur();
        },
        ...(props.options ?? { enableTime: true }),
      };
      // Add prop hooks to options
      //hooks.forEach((hook) => { if (props[hook]) { optionsNew[hook] = props[hook]; } });
      if (props.onChange) optionsNew.onChange = props.onChange;
      if (props.onOpen) optionsNew.onOpen = props.onOpen;
      if (props.onClose) optionsNew.onClose = props.onClose;
      if (props.onMonthChange) optionsNew.onMonthChange = props.onMonthChange;
      if (props.onYearChange) optionsNew.onYearChange = props.onYearChange;
      if (props.onReady) optionsNew.onReady = props.onReady;
      if (props.onValueUpdate) optionsNew.onValueUpdate = props.onValueUpdate;
      if (props.onDayCreate) optionsNew.onDayCreate = props.onDayCreate;

      flatpickrInst = flatpickr(flatpickrNode, optionsNew);

      if (Object.prototype.hasOwnProperty.call(props, "value")) {
        flatpickrInst.setDate(props.value, false, props.dateFormat);
      }
      const { onCreate } = props;
      if (onCreate) onCreate(flatpickrInst);
    }
  };
  createEffect(() => {
    if (props.value) {
      if (flatpickrInst) flatpickrInst.setDate(props.value ?? "", false, props.dateFormat);
    }
  });
  createEffect(() => {
    // TODO : Fix below line. It's not working.
    props.onChange, props.onOpen, props.onClose, props.onMonthChange, props.onYearChange, props.onReady, props.onValueUpdate, props.onDayCreate;
    if (flatpickrNode) {
      const optionsNew: Partial<BaseOptions> = {
        onClose: () => {
          flatpickrNode && flatpickrNode.blur && flatpickrNode.blur();
        },
        ...(props.options ?? { enableTime: true }),
      };
      // Add prop hooks to options
      // hooks.forEach((hook) => { if (props[hook]) { optionsNew[hook] = props[hook]; } });
      if (props.onChange) optionsNew.onChange = props.onChange;
      if (props.onOpen) optionsNew.onOpen = props.onOpen;
      if (props.onClose) optionsNew.onClose = props.onClose;
      if (props.onMonthChange) optionsNew.onMonthChange = props.onMonthChange;
      if (props.onYearChange) optionsNew.onYearChange = props.onYearChange;
      if (props.onReady) optionsNew.onReady = props.onReady;
      if (props.onValueUpdate) optionsNew.onValueUpdate = props.onValueUpdate;
      if (props.onDayCreate) optionsNew.onDayCreate = props.onDayCreate;
      let key: keyof Options;
      for (key in optionsNew) {
        const value = optionsNew[key];
        flatpickrInst.set(key, value);
      }
    }
  });

  const handleNodeChange = (node: HTMLElement) => {
    flatpickrNode = node;
    destroyFlatpickrInstance();
    createFlatpickrInstance();
  };

  return props?.options?.wrap ? (
    <div class={props.className} ref={handleNodeChange}>
      {props.children}
    </div>
  ) : (
    <>
      <Label name={props.label} />
      <input name={props.label} class={props.className} required={props.required} disabled={props.disabled} ref={handleNodeChange} />
      <span>{props.error}</span>
    </>
  );
};
