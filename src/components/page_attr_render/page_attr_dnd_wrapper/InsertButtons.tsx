import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { PageLayoutObject, useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { ComponentList } from "~/components/page_designer/form_elements/components/ComponentList";
import { handleDropAtPosition } from "~/components/page_designer/functions/handleDropAtPosition";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function InsertButtons(props: Readonly<{ item: Vertex }>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  let insertBeforeButtonsRef: HTMLElement;
  let insertAfterButtonsRef: HTMLElement;
  let insertInsideButtonsRef: HTMLElement;
  const [showBeforeMenu, setShowBeforeMenu] = createSignal(false);
  const [showAfterMenu, setShowAfterMenu] = createSignal(false);
  const [showInsideMenu, setShowInsideMenu] = createSignal(false);

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  return (
    <>
      <IconButton
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon="gg:insert-before-o"
        iconClass="transition:0.5s|ease-in-out"
        onClick={() => setShowBeforeMenu(true)}
        ref={(el) => (insertBeforeButtonsRef = el)}
        size={18}
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
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon="gg:insert-after-o"
        iconClass="transition:0.5s|ease-in-out"
        onClick={() => setShowAfterMenu(true)}
        ref={(el) => (insertAfterButtonsRef = el)}
        size={18}
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
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon="material-symbols:add-circle-outline"
        iconClass="transition:0.5s|ease-in-out"
        onClick={() => setShowInsideMenu(true)}
        ref={(el) => (insertInsideButtonsRef = el)}
        size={18}
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
        rootExpression={`g:'Comp[Root]'`}
        onDoubleClick={props.onDoubleClick}
      />
    </DropdownMenu>
  );
}
