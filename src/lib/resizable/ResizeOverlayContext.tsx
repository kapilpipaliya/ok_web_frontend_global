import {
  createContext,
  createSignal,
  Show,
  useContext,
  type ParentProps,
} from "solid-js";

import { ResizeOverlay } from "~/components/styled/ResizeOverlay";

const ResizeOverlayContext = createContext<{
  setResizing: (active: boolean) => void;
}>();

export function ResizeOverlayProvider(props: ParentProps) {
  const [isResizing, setIsResizing] = createSignal(false);

  const setResizing = (active: boolean) => {
    setIsResizing(active);
  };

  return (
    <ResizeOverlayContext.Provider value={{ setResizing }}>
      {props.children}
      <Show when={isResizing()}>
        <ResizeOverlay />
      </Show>
    </ResizeOverlayContext.Provider>
  );
}

export function useResizeOverlay() {
  const context = useContext(ResizeOverlayContext);
  if (!context) {
    return { setResizing: (_active: boolean) => {} };
  }
  return context;
}
