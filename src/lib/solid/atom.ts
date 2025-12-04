import { createSignal, Signal } from "solid-js";

export function atom<T>(initial: T) {
  const [get, set] = createSignal<T>(initial);

  function atom(): T;
  function atom(value: T): void;
  function atom(value?: T) {
    if (arguments.length === 0) return get();
    return set(value as ReturnType<typeof createSignal>[1]);
  }

  atom.get = get;
  atom.set = set;

  return atom;
}
