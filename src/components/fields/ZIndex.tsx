import { createContext, type JSX, useContext } from "solid-js";

const ZIndexContext = createContext<number>();

export function ZIndex(
  props: Readonly<{ children: JSX.Element }>,
): JSX.Element {
  const context = useContext(ZIndexContext);

  let zIndex: number;
  if (context === undefined) {
    zIndex = -1;
  } else {
    zIndex = context;
  }

  return (
    <ZIndexContext.Provider value={zIndex + 1}>
      {props.children}
    </ZIndexContext.Provider>
  );
}
export function useZIndex(): number {
  const context = useContext(ZIndexContext);
  return context !== undefined ? context : 0;
}
