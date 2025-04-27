import {
  type Accessor,
  createMemo,
  createSelector,
  createSignal,
  For,
  Show,
  untrack,
  createEffect,
} from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { useToast } from "~/components/styled/modal/Toast";
import { generateBoxShadow } from "~/features/css_editor/utils/generate/generateBoxShadow";
import { handleDragStart } from "~/features/page_designer/event_handler/handleDragStart";
import { handleDrop } from "~/features/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/features/page_designer/event_handler/resetDragDropState";
import { getDnDBoxShadowArgs } from "~/features/page_designer/functions/drag_drop/ui/getDnDBoxShadowArgs";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties, replaceVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";
import { createOpenInNewTab, buttonStyle } from "../../form_elements/common/ItemStyles";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { handleDragOver } from "../../event_handler/handleDragOver";
import { getChildrenAttrs } from "../../functions/layout/getChildrenAttrs";
import { AttrConfigIcons } from "./AttrConfigIcons";
import { HideShowIcon } from "./HideShowIcon";
import { TreeItemContainer } from "./TreeItemContainer";
import { TreeItemContent } from "./TreeItemContent";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { JsonEditorFieldComponent } from "../properties/JsonEditorField";
import { IconButton } from "~/components/styled/IconButton";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { evalExpression } from "~/lib/expression_eval";

export function LayoutTreeItem(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const { showErrorToast } = useToast();
  const activeItemChanged = createSelector(
    () => layoutStoreVertex()?.P.activeItem,
  );
  const isActiveTargetItem = () => activeItemChanged(props.metaVertex.id);

  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex),
  );
  const [parentRef, setParentRef] = createSignal<HTMLElement>();

  // Add auto-scroll effect when item is selected
  createEffect(() => {
    if (isSelectedLayoutId(props.metaVertex.id) && parentRef()) {
      // Use a small timeout to ensure the DOM is fully updated
      setTimeout(() => {
        parentRef()?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 50);
    }
  });

  let startTime = 0;

  // debounce is giving error, node not found
  const handleDragOverEvent = (e: DragEvent) => {
    handleDragOver(
      e,
      layoutStoreVertex(),
      formStoreVertex(),
      props.metaVertex,
      false,
      props.collapsedKeys,
      children,
      graph,
      setGraph,
      graph.vertexes[formStoreVertex()?.P.formDataId] || null,
      (position) => {
        if (position === "center" && Date.now() - startTime > 1000) {
          if (props.collapsedKeys().includes(props.metaVertex.id)) {
            props.toggleExpand(props.metaVertex.id);
          }
        }
      },
    );
  };

  const handleDragLeave = () => {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId!,
      graph,
      setGraph,
      {
        activeItem: null,
        position: null,
      },
    );
  };

  const handleDropEvent = async (e: DragEvent) => {
    await handleDrop(
      e,
      layoutStoreVertex(),
      formStoreVertex(),
      graph,
      setGraph,
      showErrorToast,
    );
    resetDragDropState(layoutStoreVertex(), graph, setGraph);
  };

  const handleClick = () => {
    onLayoutItemClick(
      layoutStoreVertex(),
      formStoreVertex(),
      props.metaVertex.id,
      graph,
      setGraph,
    );
  };

  const handleMouseOver = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      hoverId: props.metaVertex.id,
    });
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      hoverId: -1,
    });
  };

  const isAfter = createMemo(
    () => isActiveTargetItem() && layoutStoreVertex()?.P.position === "after",
  );

  const getBorder = createMemo(() => {
    let boxShadow = "";

    if (isActiveTargetItem()) {
      if (layoutStoreVertex()?.P.position !== "after") {
        const boxShadowProps = getDnDBoxShadowArgs(
          layoutStoreVertex()?.P.position,
          "green",
        );
        boxShadow = `box-shadow:${generateBoxShadow([boxShadowProps])};`;
      }
    }

    if (isSelectedLayoutId(props.metaVertex.id)) {
      boxShadow += " background-color:rgb(197,221,255);";
    } else if (isSelectedHoverId(props.metaVertex.id)) {
      boxShadow += " background-color:#F2EDED;";
    }

    return boxShadow;
  });

  const [showJsonEditor, setShowJsonEditor] = createSignal(false);
  
  // Update local state when global setting changes
  createEffect(() => {
    const showAllJsonEditors = formStoreVertex()?.P.showAllJsonEditors ?? false;
    setShowJsonEditor(showAllJsonEditors);
  });

  const replacePropertiesValue = (properties: { [key: string]: unknown }) => {
    untrack(() => {
      replaceVertexProperties(
        formStoreVertex()?.P.txnId,
        props.metaVertex.id,
        graph,
        setGraph,
        properties
      );
    });
    saveUndoPoint(formStoreVertex()?.P.txnId, graph, setGraph);
  };

    const getCopmVertex = (() =>
    (evalExpression("->$0Comp", {
          graph,
          setGraph,
          vertexes: [props.metaVertex],
        }) as Vertex[]) || ([] as Vertex[])
  );

  // Create open in new tab handler
  const openInNewTab = createOpenInNewTab(
    layoutStoreId,
    getCopmVertex()[0],
    graph,
    setGraph
  );

  return (
    <>
      <TreeItemContainer
        css={css`${getBorder()}`}
        draggable={"true"}
        hasChildren={!!children().length}
        isDragOver={isActiveTargetItem()}
        isHovered={isSelectedHoverId(props.metaVertex.id)}
        isSelected={isSelectedLayoutId(props.metaVertex.id)}
        itemId={props.metaVertex.id}
        onClick={handleClick}
        onDragEnter={(e) => {
          startTime = Date.now();
          handleDragOverEvent(e);
        }}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOverEvent}
        onDragStart={(e) =>
          handleDragStart(
            e,
            graph,
            setGraph,
            layoutStoreVertex(),
            props.metaVertex,
          )
        }
        onDrop={handleDropEvent}
        onMouseEnter={handleMouseOver}
        onmouseleave={handleMouseLeave}
        ref={(el) => {
          setParentRef(el);
          // @ts-expect-error ignore
          el.useCurrentPosition = true;
        }}
      >
        <TreeItemContent
          collapsedKeys={props.collapsedKeys}
          metaVertex={props.metaVertex}
          toggleExpand={props.toggleExpand}
        />
        <HideShowIcon iconSize={20} metaVertex={props.metaVertex} />
        <IconButton
          css={[
            ICON_BUTTON_STYLES.baseCss,
            ICON_BUTTON_STYLES.defaultCss,
            ICON_BUTTON_STYLES.spacingCss,
            css`
    background-color: transparent;
    border: none;
    ${showJsonEditor() ? 'color: ${args.theme.var.color.primary};' : ''}
  `,]}
          icon="tabler:json"
          size={16}
          onClick={(e) => {
            e.stopPropagation();
            setShowJsonEditor(!showJsonEditor());
          }}
          title={showJsonEditor() ? "Hide JSON editor" : "Show JSON editor"}
        />
        <Show when={isSelectedHoverId(props.metaVertex.id) && props.metaVertex.L && props.metaVertex.P.componentName === "Component"}>
          <IconButton
            css={buttonStyle}
            icon="ph:arrow-square-out"
            onClick={(e) => {
              e.stopPropagation();
              openInNewTab();
            }}
            size={18}
            title="Open in new tab"
          />
        </Show>
        {/* <Show when={formStoreVertex()?.P.formDataId !== props.metaVertex.id}> */}
          <AttrConfigIcons
            metaVertex={props.metaVertex}
            parentRef={parentRef()!}
          />
        {/* </Show> */}
      </TreeItemContainer>
      <Show when={showJsonEditor()}>
        <As
          as="div"
          css={css`
            margin-left: 24px;
            margin-bottom: 8px;
            width: calc(100% - 24px);
            height: auto;
            overflow: visible;
          `}
        >
          <JsonEditorFieldComponent 
            vertexId={props.metaVertex.id} 
            hideLabel={true} 
            replaceProperties={replacePropertiesValue} 
          />
        </As>
      </Show>

      <Show
        when={
          !props.collapsedKeys().includes(props.metaVertex?.id) &&
          children().length > 0
        }
      >
        <As
          as="ul"
          css={css`
  padding-left: 8px;
  padding-top: 5px;
  list-style: none;
`}
        >
          <For each={children()}>
            {(vertex) => (
              <Show when={formStoreVertex()}>
                <LayoutTreeItem
                  collapsedKeys={props.collapsedKeys}
                  metaVertex={vertex}
                  toggleExpand={props.toggleExpand}
                />
              </Show>
            )}
          </For>
        </As>
      </Show>
      <Show when={isAfter()}>
        <As
          as="div"
          css={css`
  border: 1px solid #3b82f6;
`}
        />
      </Show>
    </>
  );
}
