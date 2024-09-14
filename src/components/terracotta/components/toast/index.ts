import type { JSX } from "solid-js";

import {
  createComponent,
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  useContext,
} from "solid-js";
import { omitProps } from "solid-use/props";

import type {
  DynamicProps,
  HeadlessProps,
  ValidConstructor,
} from "../../utils/dynamic-prop";

import assert from "../../utils/assert";
import createDynamic from "../../utils/create-dynamic";
import { createTag } from "../../utils/namespace";

const TOAST_TAG = createTag("toast");
const TOASTER_TAG = createTag("toaster");

interface ToastContextData {
  ownerID: string;
}

const ToastContext = createContext<ToastContextData>();

function useToastContext(componentName: string): ToastContextData {
  const context = useContext(ToastContext);
  assert(
    context,
    new Error(`<${componentName}> must be used inside a <Toaster>`),
  );
  return context;
}

export type ToastProps<T extends ValidConstructor = "div"> = HeadlessProps<T>;

export function Toast<T extends ValidConstructor = "div">(
  props: ToastProps<T>,
): JSX.Element {
  useToastContext("Toast");

  return createDynamic(
    () => props.as || ("div" as T),
    mergeProps(omitProps(props, ["as"]), TOAST_TAG, {
      "aria-live": "polite",
      role: "status",
    }) as DynamicProps<T>,
  );
}

export type ToasterProps<T extends ValidConstructor = "div"> = HeadlessProps<T>;

export function Toaster<T extends ValidConstructor = "div">(
  props: ToasterProps<T>,
): JSX.Element {
  const ownerID = createUniqueId();

  return createComponent(ToastContext.Provider, {
    get children() {
      return createDynamic(
        () => props.as || ("div" as T),
        mergeProps(omitProps(props, ["as"]), TOASTER_TAG) as DynamicProps<T>,
      );
    },
    value: {
      ownerID,
    },
  });
}
export interface ToastData<T> {
  data: T;
  id: string;
}

export type ToasterListener<T> = (queue: ToastData<T>[]) => void;

export class ToasterStore<T> {
  private static toasterID = 0;

  private id: number;

  private listeners = new Set<ToasterListener<T>>();

  private queue: ToastData<T>[] = [];

  private toastID = 0;

  constructor() {
    this.id = ToasterStore.toasterID;
    ToasterStore.toasterID += 1;
  }

  private notify(): void {
    const clone = [...this.queue];
    for (const listener of this.listeners.keys()) {
      listener(clone);
    }
  }

  clear(): void {
    this.queue = [];
    this.notify();
  }

  create(data: T): string {
    const id = `toast-${this.id}-[${this.toastID}`;
    this.toastID += 1;
    this.queue.push({
      data,
      id,
    });
    this.notify();
    return id;
  }

  getQueue(): ToastData<T>[] {
    return this.queue;
  }

  remove(id: string): void {
    this.queue = this.queue.filter((item) => item.id !== id);
    this.notify();
  }

  subscribe(callback: ToasterListener<T>): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export function useToaster<T>(toaster: ToasterStore<T>): () => ToastData<T>[] {
  const [signal, setSignal] = createSignal(toaster.getQueue());

  createEffect(() => {
    onCleanup(toaster.subscribe(setSignal));
  });

  return signal;
}
