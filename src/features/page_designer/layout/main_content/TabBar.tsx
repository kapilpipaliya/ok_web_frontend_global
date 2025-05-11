import { For, Show } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { createViewVertex } from "~/lib/graph/mutate/vertex/createViewVertex";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { getTabLabel } from "./functions/getTabLabel";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function TabBar(props: { mainPanel: Id }) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const handleClose = (openedFormId: Id) => {
    const openTab = layoutStore().openedFormIds.find((f) => f !== openedFormId);
    const prevFormId = graph.vertexes[openTab!]?.P.formId || null;
    // Note: cloneProperties is false because we don't want to clone the properties of the form. It cause re-render of the form.
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId,
      graph,
      setGraph,
      {
        [`mainPanel${props.mainPanel}Tab`]: prevFormId,
        formId: prevFormId,
        openedFormIds: layoutStore().openedFormIds.filter(
          (f) => f !== openedFormId,
        ),
      },
      { cloneProperties: false },
    );
    deleteVertex(0, openedFormId, graph, setGraph);
  };

  const handleTabClick = (formId: string) => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      [`mainPanel${props.mainPanel}Tab`]: formId,
      formId,
    });
  };

  const isUnsaved = (formId: string) => {
    const vertex = graph.vertexes[formId] as Vertex<FormStoreObject>;
    return vertex?.P.txnId && !isDisabledTxn(vertex.P.txnId, graph);
  };

  const addMainPanel = () => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      mainPanel: [...layoutStore().mainPanel, uuidv7()],
    });
  };

  const moveTab = (toPanelId: Id) => {
    const dragInfo = layoutStore().draggedTab;
    if (!dragInfo) {
      return;
    }

    const tab = graph.vertexes[dragInfo].P.mainPanel;
    if (!tab) {
      return;
    }
    if (tab === toPanelId) {
      return;
    }

    mergeVertexProperties(0, dragInfo, graph, setGraph, {
      mainPanel: toPanelId,
    });
    const prevTabOpenForms = layoutStore().openedFormIds.filter(
      (id) => graph.vertexes[id].P.mainPanel === tab,
    );
    mergeVertexProperties(0, layoutStoreId, graph, setGraph, {
      [`mainPanel${tab}Tab`]:
        graph.vertexes[prevTabOpenForms[prevTabOpenForms.length - 1]]?.P
          .formId || null,
    });
    mergeVertexProperties(0, layoutStoreId, graph, setGraph, {
      [`mainPanel${toPanelId}Tab`]: graph.vertexes[dragInfo]?.P.formId || null,
    });
    mergeVertexProperties(0, layoutStoreId, graph, setGraph, {
      draggedTab: null,
    });
  };

  const moveFormsToPanel = (fromPanelId: Id, toPanelId: Id) => {
    const formsToMove = layoutStore().openedFormIds.filter(
      (id) => graph.vertexes[id].P.mainPanel === fromPanelId,
    );

    for (const formId of formsToMove) {
      mergeVertexProperties(0, formId, graph, setGraph, {
        mainPanel: toPanelId,
      });
    }
  };

  return (
    <As
      as="div"
      css={css`
  display: flex;
  gap: 5px;
  padding: 5px;
  border-bottom: 1px solid #ccc;
  background-color: #f5f5f5;
`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => moveTab(props.mainPanel)}
    >
      <IconButton
        icon="ph:plus-circle"
        css={css`
          background-color: transparent;
          border: none;
          color: \${args.theme.var.color.base_80};
          &:hover {
            color: \${args.theme.var.color.primary_200};
          }
        `}
        onClick={addMainPanel}
        size={22}
        title="Add New Panel"
      />
      <As
        as="div"
        css={css`
          display: flex;
          gap: 5px;
          overflow-x: auto;
          flex-grow: 1;
          scrollbar-width: thin;
        `}
      >
        <For
          each={layoutStore().openedFormIds.filter(
            (id) => graph.vertexes[id].P.mainPanel === props.mainPanel,
          )}
        >
          {(openedFormId, index) => (
            <As
              as="div"
              css={css`
  align-items: center;
  border-radius: 4px;
  display: flex;
  gap: 5px;
  padding: 5px;
  ${layoutStore()[`mainPanel${props.mainPanel}Tab`] === graph.vertexes[openedFormId].P.formId ? "background-color: ${args.theme.var.color.primary_35};" : "background-color: ${args.theme.var.color.base_15};"}
  ${layoutStore().formId === graph.vertexes[openedFormId].P.formId ? "border-bottom: 2px solid red;" : ""}
  cursor: move;
  flex-shrink: 0;
`}
              draggable={"true"}
              onClick={[handleTabClick, graph.vertexes[openedFormId].P.formId]}
              onDragOver={(e) => e.preventDefault()}
              onDragStart={(e) => {
                // Set required data for drag operation
                e.dataTransfer?.setData("text/plain", openedFormId);
                mergeVertexProperties(0, layoutStoreId, graph, setGraph, {
                  draggedTab: openedFormId,
                });
              }}
              onDrop={() => moveTab(props.mainPanel)}
            >
              <As
                as="span"
                css={css`
  user-select: none;
  white-space: nowrap;
`}
              >
                {getTabLabel(openedFormId, graph)}
                {isUnsaved(graph.vertexes[openedFormId].P.formId) && (
                  <As
                    as="span"
                    css={css`
                      color:\${args.theme.var.color.error};
                      font-weight: bold;
                      margin-left: 3px;
                      display: inline-block;
                    `}
                    title="Unsaved changes"
                  >
                    *
                  </As>
                )}
              </As>
              <IconButton
                icon="ph:plus"
                css={css`
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: \${args.theme.var.color.primary};
  &:hover {
    color: \${args.theme.var.color.primary_200};
  }
`}
                onClick={() => {
                  const newView = createViewVertex(
                    { view: "Mobile" },
                    graph,
                    setGraph,
                  );
                  mergeVertexProperties<FormStoreObject>(
                    0,
                    graph.vertexes[openedFormId].P.formId,
                    graph,
                    setGraph,
                    {
                      openedViews: [
                        ...graph.vertexes[graph.vertexes[openedFormId].P.formId]
                          ?.P.openedViews,
                        newView.id,
                      ],
                    },
                  );
                }}
                size={16}
                title="Add View"
              />
              <Show when={index() !== 0}>
                <IconButton
                  css={css`
  background-color: transparent;
  color: \${args.theme.var.color.error};
  cursor: pointer;
  border: none;
  &:hover {
    color: \${args.theme.var.color.error_200};
  }
`}
                  icon="ph:x"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose(openedFormId);
                  }}
                  size={16}
                  title="Close Tab"
                />
              </Show>
            </As>
          )}
        </For>
      </As>
      <Show when={layoutStore().mainPanel.length > 1}>
        <IconButton
          css={css`
  margin-left: auto;
  background-color: transparent;
  border: none;
  color: \${args.theme.var.color.base_80};
  &:hover {
    color: \${args.theme.var.color.error_200};
  }
`}
          icon="ph:x-circle"
          onClick={() => {
            const panelIndex = layoutStore().mainPanel.indexOf(props.mainPanel);
            const previousPanelId = layoutStore().mainPanel[panelIndex - 1];
            const nextPanelId = layoutStore().mainPanel[panelIndex + 1];
            const targetPanelId = previousPanelId || nextPanelId;

            // Move all forms from current panel to target panel
            moveFormsToPanel(props.mainPanel, targetPanelId);

            // Remove the current panel
            mergeVertexProperties<PageLayoutObject>(
              0,
              layoutStoreId,
              graph,
              setGraph,
              {
                mainPanel: layoutStore().mainPanel.filter(
                  (id) => id !== props.mainPanel,
                ),
              },
            );
          }}
          size={22}
          title="Close Panel"
        />
      </Show>
    </As>
  );
}
