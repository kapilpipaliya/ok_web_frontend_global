import { autoUpdate } from "@floating-ui/dom";
import { useFloating } from "solid-floating-ui";
import { type Accessor, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

import type { Vertex } from "~/lib/graph/graph";

import { ZIndex } from "~/components/ZIndex";

import { AttrConfigPopOver } from "./AttrConfigPopOver";

export function AttrConfigPopOverWrapper(props: Readonly<{ isSelectedLayoutId: boolean; item: Vertex; reference: Accessor<HTMLElement | null>; }>) {
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const position = useFloating(props.reference, floating, {
    placement: props.isSelectedLayoutId ? "top-start" : "top-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate
  });
  return (
    <ZIndex>
      <Portal>
        <div
          class=""
          ref={setFloating}
          style={{
            left: `${position.x ?? 0}px`,
            position: position.strategy,
            top: `${position.y ?? 0}px`
          }}
        >
          <AttrConfigPopOver item={props.item} />
        </div>
      </Portal>
    </ZIndex>
  );
}
