import { createSignal, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { FloatingFormDropdown } from "~/components/styled/dialog/FloatingFormDropdown";
import { IconButton } from "~/components/styled/IconButton";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { ComponentList } from "~/features/page_designer/form_elements/components/ComponentList";
import { handleDropAtPosition } from "~/features/page_designer/functions/drag_drop/core/handleDropAtPosition";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function InsertButtons(props: Readonly<{ item: Vertex; size: number }>) {
  const [graph, setGraph] = useGraph();
  const [insertBeforeButtonsRef, setInsertBeforeButtonsRef] = createSignal<
    HTMLElement | undefined
  >();
  const [insertAfterButtonsRef, setInsertAfterButtonsRef] = createSignal<
    HTMLElement | undefined
  >();
  const [insertInsideButtonsRef, setInsertInsideButtonsRef] = createSignal<
    HTMLElement | undefined
  >();
  const [showBeforeMenu, setShowBeforeMenu] = createSignal(false);
  const [showAfterMenu, setShowAfterMenu] = createSignal(false);
  const [showInsideMenu, setShowInsideMenu] = createSignal(false);

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isRootLevel = () => formStoreVertex()?.P.formDataId === props.item.id;

  const getFormData = () =>
    graph.vertexes[formStoreVertex()?.P.formDataId || ""] || undefined;

  return (
    <>
      <Show when={!isRootLevel()}>
        <IconButton
          css={[
            ICON_BUTTON_STYLES.baseCss,
            ICON_BUTTON_STYLES.defaultCss,
            ICON_BUTTON_STYLES.spacingCss,
            `return \`._id {
              background-color: transparent;
              border: none;
            }\`;`,
          ]}
          icon="ph:arrow-line-up"
          iconCss={"return `._id {transition:transform 0.2s;}`;"}
          onClick={(e) => {
            e.stopPropagation();
            setShowBeforeMenu(true);
          }}
          ref={(el) => setInsertBeforeButtonsRef(el)}
          size={props.size}
          title="Insert Before"
        />
        <Show when={showBeforeMenu() && insertBeforeButtonsRef()}>
          <InsertButtonsMenu
            item={props.item}
            onClose={() => setShowBeforeMenu(false)}
            onDoubleClick={async (fromVertex) => {
              await handleDropAtPosition(
                graph,
                setGraph,
                formStoreVertex()?.P.txnId,
                getFormData(),
                fromVertex,
                props.item,
                "before",
              );
              setShowBeforeMenu(false);
            }}
            parentRef={insertBeforeButtonsRef()!}
            subtitle="Double-click a component to insert before the selected element."
            title="Insert Before"
          />
        </Show>

        <IconButton
          css={[
            ICON_BUTTON_STYLES.baseCss,
            ICON_BUTTON_STYLES.defaultCss,
            ICON_BUTTON_STYLES.spacingCss,
            `return \`._id {
              background-color: transparent;
              border: none;
            }\`;`,
          ]}
          icon="ph:arrow-line-down"
          iconCss={"return `._id {transition:transform 0.2s;}`;"}
          onClick={(e) => {
            e.stopPropagation();
            setShowAfterMenu(true);
          }}
          ref={(el) => setInsertAfterButtonsRef(el)}
          size={props.size}
          title="Insert After"
        />
        <Show when={showAfterMenu() && insertAfterButtonsRef()}>
          <InsertButtonsMenu
            item={props.item}
            onClose={() => setShowAfterMenu(false)}
            onDoubleClick={async (fromVertex) => {
              await handleDropAtPosition(
                graph,
                setGraph,
                formStoreVertex()?.P.txnId,
                getFormData(),
                fromVertex,
                props.item,
                "after",
              );
              setShowAfterMenu(false);
            }}
            parentRef={insertAfterButtonsRef()!}
            subtitle="Double-click a component to insert after the selected element."
            title="Insert After"
          />
        </Show>
      </Show>

      <IconButton
        css={[
          ICON_BUTTON_STYLES.baseCss,
          ICON_BUTTON_STYLES.defaultCss,
          ICON_BUTTON_STYLES.spacingCss,
          `return \`._id {
            background-color: transparent;
            border: none;
          }\`;`,
        ]}
        icon="ph:plus-circle"
        iconCss={"return `._id {transition:transform 0.2s;}`;"}
        onClick={(e) => {
          e.stopPropagation();
          setShowInsideMenu(true);
        }}
        ref={(el) => setInsertInsideButtonsRef(el)}
        size={props.size}
        title="Add Inside"
      />
      <Show when={showInsideMenu() && insertInsideButtonsRef()}>
        <InsertButtonsMenu
          item={props.item}
          onClose={() => setShowInsideMenu(false)}
          onDoubleClick={async (fromVertex) => {
            await handleDropAtPosition(
              graph,
              setGraph,
              formStoreVertex()?.P.txnId,
              getFormData(),
              fromVertex,
              props.item,
              "center",
            );
            setShowInsideMenu(false);
          }}
          parentRef={insertInsideButtonsRef()!}
          subtitle="Double-click a component to add it inside the selected element."
          title="Add Inside"
        />
      </Show>
    </>
  );
}

export function InsertButtonsMenu(
  props: Readonly<{
    item: Vertex;
    title: string;
    subtitle: string;
    onClose: () => void;
    onDoubleClick: (fromVertex: Vertex) => void;
    parentRef: HTMLElement;
  }>,
) {
  return (
    <FloatingFormDropdown
      onClickOutside={props.onClose}
      parentRef={props.parentRef}
      showFooter={false}
      subtitle={props.subtitle}
      title={props.title}
    >
      <ComponentList
        edgeName="ParentComp"
        onDoubleClick={props.onDoubleClick}
        rootExpression={`g:'Comp[Root]'`}
      />
    </FloatingFormDropdown>
  );
}
