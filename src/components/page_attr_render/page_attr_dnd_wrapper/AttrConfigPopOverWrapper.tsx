import type { Strategy } from "@floating-ui/dom";

import createFloating from "@corvu/utils/create/floating";
import { type Accessor, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { getFloatingStyle } from '@corvu/utils/floating'

import type { Vertex } from "~/lib/graph/graph";

import { ZIndex } from "~/components/fields/ZIndex";

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
    options: () => ({
      flip: {
        padding: {
          top: 28,
          bottom: 28
        },
        // this seems not working now
        // fallbackPlacements: ['top', 'top-end', 'bottom-start'],
      },
      shift: {},
      offset: ({ placement }) => {
        return placement.startsWith('bottom') ? 30 : 1;
      }
    }),
    placement: () => (props.isSelectedLayoutId ? "top-start" : "top-start"),
    reference: () => props.reference() ?? null,
    strategy,
  });

  return (
    <ZIndex>
      <Portal>
        <div
          ref={setFloating}
          style={{
            ...getFloatingStyle({
              strategy: () => strategy(),
              floatingState: () => floatingState(),
            })(),
          }}
        >
          <AttrConfigPopOver item={props.item} />
        </div>
      </Portal>
    </ZIndex>
  );
}
