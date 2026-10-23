import type { Strategy } from "@floating-ui/dom";

import { type Accessor, createSignal } from "solid-js";
import { Portal } from "@solidjs/web";

import { ZIndex } from "~/components/fields/ZIndex";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { createFloating } from "~/lib/dom/createFloating";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import { createClickOutside } from "~/lib/hooks/createClickOutside";

import { AttrConfigPopOver } from "./AttrConfigPopOver";

export function AttrConfigPopOverWrapper(
  props: Readonly<{
    item: Vertex;
    reference: Accessor<HTMLElement | null>;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const strategy = () => "fixed" as Strategy;

  const floatingState = createFloating({
    enabled: () => !!props.reference(),
    floating,
    options: () => ({
      flip: {
        padding: {
          bottom: 28,
          top: 28,
        },
        // this seems not working now
        // fallbackPlacements: ['top', 'top-end', 'bottom-start'],
      },
      offset: ({ placement }) => (placement.startsWith("bottom") ? 30 : 1),
      shift: {},
    }),
    placement: () => "top-start",
    reference: () => props.reference() ?? null,
    strategy,
  });

  createClickOutside(graph, setGraph, (event) => {
    const eventClickPath = event.composedPath();
    if (
      !(
        eventClickPath.includes(floating()!) ||
        eventClickPath.includes(props.reference()!)
      )
    ) {
      const formStore = graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
      if (formStore?.P.selectedId !== -1) {
        mergeVertexProperties<FormStoreObject>(
          0,
          formStoreId!,
          graph,
          setGraph,
          {
            selectedId: -1,
          },
        );
      }
    }
  });

  return (
    <ZIndex>
      <Portal>
        <div
          ref={setFloating}
          style={{
            left: `${floatingState().x}px`,
            position: strategy(),
            top: `${floatingState().y}px`,
            "z-index": 99999,
          }}
        >
          <AttrConfigPopOver item={props.item} />
        </div>
      </Portal>
    </ZIndex>
  );
}
