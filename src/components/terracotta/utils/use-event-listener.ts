import { onCleanup } from 'solid-js';

function useEventListener<
  T extends HTMLElement,
  K extends keyof HTMLElementEventMap,
>(
  node: T,
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean,
): void;
function useEventListener<T extends Window, K extends keyof WindowEventMap>(
  node: T,
  type: K,
  listener: (ev: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean,
): void;
function useEventListener<T extends Document, K extends keyof DocumentEventMap>(
  node: T,
  type: K,
  listener: (ev: DocumentEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean,
): void;
function useEventListener<T extends Document, K extends keyof DocumentEventMap>(
  node: T,
  type: K,
  listener: (ev: DocumentEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean,
): void {
  node.addEventListener(type, listener, options);
  onCleanup(() => {
    node.removeEventListener(type, listener, options);
  });
}

export default useEventListener;
