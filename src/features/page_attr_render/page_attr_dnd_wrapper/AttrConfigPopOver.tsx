import { createVisibilityObserver } from "@solid-primitives/intersection-observer";
import { createSelector, Match, Switch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { useGraph } from "~/lib/graph/graph";

import { HoverAttrConfigPopOver } from "./HoverAttrConfigPopOver";
import { SelectedAttrConfigPopOver } from "./SelectedAttrConfigPopOver";

export function AttrConfigPopOver(props: Readonly<{ item: Vertex }>) {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);

  let popoverRef: HTMLDivElement | undefined;
  const useVisibilityObserver = createVisibilityObserver({ threshold: 0.8 });
  const _visible = useVisibilityObserver(() => popoverRef);

  return (
    <div ref={popoverRef}>
      <div
      // classList={{ hide: !visible() }}
      >
        <Switch>
          <Match when={isSelectedLayoutId(props.item.id)}>
            <SelectedAttrConfigPopOver item={props.item} />
          </Match>
          <Match
            when={
              isSelectedHoverId(props.item.id) ||
              formStoreVertex()?.P.multiHighlight.includes(props.item.id)
            }
          >
            <HoverAttrConfigPopOver item={props.item} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}
