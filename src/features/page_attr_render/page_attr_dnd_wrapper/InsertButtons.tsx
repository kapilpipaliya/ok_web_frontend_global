import { createSignal, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IconButton } from "~/components/styled/IconButton";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { ComponentList } from "~/features/page_designer/form_elements/components/ComponentList";
import { handleDropAtPosition } from "~/features/page_designer/functions/handleDropAtPosition";
import { useGraph } from "~/lib/graph/graph";
import {ICON_BUTTON_STYLES} from "~/pages/settings/constants";

export function InsertButtons(props: Readonly<{ item: Vertex; size: number }>) {
  const [graph, setGraph] = useGraph();
  let insertBeforeButtonsRef: HTMLElement;
  let insertAfterButtonsRef: HTMLElement;
  let insertInsideButtonsRef: HTMLElement;
  const [showBeforeMenu, setShowBeforeMenu] = createSignal(false);
  const [showAfterMenu, setShowAfterMenu] = createSignal(false);
  const [showInsideMenu, setShowInsideMenu] = createSignal(false);

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <>
      <IconButton
        class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.default} ${ICON_BUTTON_STYLES.spacing}`}
        icon="ph:arrow-line-up"
        iconClass="transition:transform|0.2s"
        onClick={(e) => {
          e.stopPropagation();
          setShowBeforeMenu(true);
        }}
        ref={(el) => (insertBeforeButtonsRef = el)}
        size={props.size}
        title="Add Before"
      />
      <Show when={showBeforeMenu()}>
        <InsertButtonsMenu
          item={props.item}
          onClose={() => setShowBeforeMenu(false)}
          onDoubleClick={async (fromVertex) => {
            await handleDropAtPosition(
              graph,
              setGraph,
              formStoreVertex()?.P.txnId,
              graph.vertexes[formStoreVertex()?.P.formDataId!],
              fromVertex,
              props.item,
              "before",
            );
          }}
          onMouseLeave={() => setShowBeforeMenu(false)}
          parentRef={insertBeforeButtonsRef!}
        />
      </Show>

      <IconButton
        class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.default} ${ICON_BUTTON_STYLES.spacing}`}
        icon="ph:arrow-line-down"
        iconClass="transition:transform|0.2s"
        onClick={(e) => {
          e.stopPropagation();
          setShowAfterMenu(true);
        }}
        ref={(el) => (insertAfterButtonsRef = el)}
        size={props.size}
        title="Add After"
      />
      <Show when={showAfterMenu()}>
        <InsertButtonsMenu
          item={props.item}
          onClose={() => setShowAfterMenu(false)}
          onDoubleClick={async (fromVertex) => {
            await handleDropAtPosition(
              graph,
              setGraph,
              formStoreVertex()?.P.txnId,
              graph.vertexes[formStoreVertex()?.P.formDataId!],
              fromVertex,
              props.item,
              "after",
            );
          }}
          onMouseLeave={() => setShowAfterMenu(false)}
          parentRef={insertAfterButtonsRef!}
        />
      </Show>

      <IconButton
        class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.default} ${ICON_BUTTON_STYLES.spacing}`}
        icon="ph:plus-circle"
        iconClass="transition:transform|0.2s"
        onClick={(e) => {
          e.stopPropagation();
          setShowInsideMenu(true);
        }}
        ref={(el) => (insertInsideButtonsRef = el)}
        size={props.size}
        title="Add Inside"
      />
      <Show when={showInsideMenu()}>
        <InsertButtonsMenu
          item={props.item}
          onClose={() => setShowInsideMenu(false)}
          onDoubleClick={async (fromVertex) => {
            await handleDropAtPosition(
              graph,
              setGraph,
              formStoreVertex()?.P.txnId,
              graph.vertexes[formStoreVertex()?.P.formDataId!],
              fromVertex,
              props.item,
              "center",
            );
          }}
          onMouseLeave={() => setShowInsideMenu(false)}
          parentRef={insertInsideButtonsRef!}
        />
      </Show>
    </>
  );
}

export function InsertButtonsMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onDoubleClick: (fromVertex: Vertex) => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
  }>,
) {
  return (
    <DropdownMenu
      class="padding:0.50rem"
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <ComponentList
        edgeName="ParentComp"
        onDoubleClick={props.onDoubleClick}
        rootExpression={`g:'Comp[Root]'`}
      />
    </DropdownMenu>
  );
}
