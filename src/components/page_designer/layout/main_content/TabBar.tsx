import { For, Show } from "solid-js";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { useGraph, Id, Vertex } from "~/lib/graph/graph";
import { createViewVertex } from "~/lib/graph/mutate/createViewVertex";
import { mergeVertexProperties, deleteVertex } from "~/lib/graph/mutate/vertex";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { useDesignerLayoutStore, PageLayoutObject, useDesignerFormIdContext } from "../../context/LayoutContext";
import { v7 as uuidv7 } from "uuid";

export function TabBar(props: {mainPanel: Id}) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const handleClose = (openedFormId: Id) => {
    const openTab = layoutStore().openedFormIds.find(f => f !== openedFormId);
    // Note: cloneProperties is false because we don't want to clone the properties of the form. It cause re-render of the form.
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId,
      graph,
      setGraph,
      {
        openedFormIds: layoutStore().openedFormIds.filter(f => f !== openedFormId),
        formId: graph.vertexes[openTab!]?.P.formId || null
      },
      { cloneProperties: false }
    );
    deleteVertex(0, openedFormId, graph, setGraph);
  };

  const handleTabClick = (formId: string) => {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId,
      graph,
      setGraph,
      {
        formId,
        [`mainPanel${props.mainPanel}Tab`]: formId
      }
    );
  };

  const isUnsaved = (formId: string) => {
    const vertex = graph.vertexes[formId] as Vertex<FormStoreObject>;
    return vertex?.P.txnId && !isDisabledTxn(vertex.P.txnId, graph);
  };

  const addMainPanel = () => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      mainPanel: [...layoutStore().mainPanel, uuidv7()]
    });
  };

  const moveTab = (toPanelId: Id) => {
    const dragInfo = layoutStore().draggedTab;
    if (!dragInfo) return;

    const tab = graph.vertexes[dragInfo].P.mainPanel;
    if (!tab) return;
    if (tab === toPanelId) return;

    mergeVertexProperties(0, dragInfo, graph, setGraph, { mainPanel: toPanelId });
    const prevTabOpenForms = layoutStore().openedFormIds.filter(id => graph.vertexes[id].P.mainPanel === tab);
    mergeVertexProperties(0, layoutStoreId, graph, setGraph, { [`mainPanel${tab}Tab`]: graph.vertexes[prevTabOpenForms[prevTabOpenForms.length - 1]]?.P.formId || null });
    mergeVertexProperties(0, layoutStoreId, graph, setGraph, { [`mainPanel${toPanelId}Tab`]: graph.vertexes[dragInfo]?.P.formId || null });
    mergeVertexProperties(0, layoutStoreId, graph, setGraph, { draggedTab: null });
  };

  return (
    <div class="display:flex gap:5px padding:5px border-bottom:1px|solid|#ccc bg:#f5f5f5"
    onDragOver={(e) => e.preventDefault()}
    onDrop={() => moveTab(props.mainPanel)}
    >
      <button onClick={addMainPanel}>Add Main Panel</button>
      <For each={layoutStore().openedFormIds.filter(id => graph.vertexes[id].P.mainPanel === props.mainPanel)}>
        {(openedFormId, index) => (
          <div
            class={`align-items:center border-radius:4px cursor:pointer display:flex gap:5px padding:5px ${useDesignerFormIdContext() === graph.vertexes[openedFormId].P.formId ? "background:#e0e0e0" : ""} cursor:move`}
            onClick={[handleTabClick, graph.vertexes[openedFormId].P.formId]}
            draggable={true}
            onDragStart={() => mergeVertexProperties(0, layoutStoreId, graph, setGraph, { draggedTab: openedFormId })}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => moveTab(props.mainPanel)}
          >
            <span>
              {graph.vertexes[openedFormId].P.label}
              {isUnsaved(graph.vertexes[openedFormId].P.formId) && "*"}
            </span>
            <button
              class="background:none border:none cursor:pointer font-size:14px padding:2px"
              onClick={() => {
                const newView = createViewVertex({ view: "Mobile" }, graph, setGraph);
                mergeVertexProperties<FormStoreObject>(
                  0,
                  graph.vertexes[openedFormId].P.formId,
                  graph,
                  setGraph,
                  {
                    openedViews: [...graph.vertexes[graph.vertexes[openedFormId].P.formId]?.P.openedViews, newView.id]
                  }
                );
              }}
            >
              +
            </button>
            <Show when={index() !== 0}>
              <button
                class="background:none border:none cursor:pointer font-size:14px padding:2px"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose(openedFormId);
                }}
              >
                ×
              </button>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
