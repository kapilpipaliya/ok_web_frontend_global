import { createSignal } from 'solid-js';

export function focusLastInput(tableElement?: HTMLTableElement) {
  if (tableElement) {
    const inputs = [...tableElement.getElementsByTagName("input")];
    inputs[inputs.length - 1].focus();
  }
}

export interface Atom<T> {
  (): T;
  (value: T): T;
}

// import atom from "solid-use/src/atom";
export default function atom<T>(value: T, equals = Object.is): Atom<T> {
  const [state, setState] = createSignal(value, {
    equals,
  });
  return (...args: [] | [T]): T => {
    if (args.length === 1) {
      setState(() => args[0]);
    }
    return state();
  };
}
