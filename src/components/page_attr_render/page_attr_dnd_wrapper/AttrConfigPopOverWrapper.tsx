import createFloating from "@corvu/utils/create/floating";
import { Strategy } from "@floating-ui/dom";
import { type Accessor, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

import type { Vertex } from "~/lib/graph/graph";

import { ZIndex } from "~/components/ZIndex";

import { AttrConfigPopOver } from "./AttrConfigPopOver";

export function AttrConfigPopOverWrapper(
  props: Readonly<{
    isSelectedLayoutId: boolean;
    item: Vertex;
    reference: Accessor<HTMLElement | null>;
  }>,
) {
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const strategy = () => "fixed" as Strategy;

  const floatingState = createFloating({
    enabled: true,
    floating: floating,
    options: () => ({}),
    placement: () => props.isSelectedLayoutId ? "top-start" : "top-start",
    reference: () => props.reference() ?? null,
    strategy,
  });

  return (
    <ZIndex>
      <Portal>
        <div
          class=""
          ref={setFloating}
          style={{
            left: `${floatingState().x ?? 0}px`,
            position: strategy(),
            top: `${floatingState().y ?? 0}px`,
          }}
        >
          <AttrConfigPopOver item={props.item} />
        </div>
      </Portal>
    </ZIndex>
  );
}
