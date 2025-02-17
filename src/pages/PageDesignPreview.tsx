import { createSignal, onMount, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { PageView } from "~/features/page_attr_render/PageView";
import {
  DesignerFormIdContext,
  DesignerLayoutStoreContext,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { handleDrop } from "~/features/page_designer/event_handler/handleDrop";
import { resetDragDropState } from "~/features/page_designer/event_handler/resetDragDropState";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { getChannel, handleChannelMessage } from "~/lib/graph/mutate/channel";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export default function PageShareView() {
  const queryParams = new URLSearchParams(window.location.search);
  const formStoreId = queryParams.get("formStoreId");
  const layoutStoreId = queryParams.get("layoutStoreId");
  if (!formStoreId) {
    return <div>No Form ID</div>;
  }
  if (!layoutStoreId) {
    return <div>No Layout Store ID</div>;
  }

  const [graph, setGraph] = useGraph();

  const channel = getChannel(formStoreId);

  channel.onmessage = (msg) =>
    handleChannelMessage(msg, graph, setGraph, formStoreId, formStoreId);

  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  onMount(() => {
    window.parent.postMessage({ type: "LOADED" }, "*");
  });

  return (
    <Show when={formStoreVertex()}>
      <DesignerLayoutStoreContext.Provider value={layoutStoreId!}>
        <DesignerFormIdContext.Provider value={formStoreId!}>
          <DroppableWrapper formStoreId={formStoreId}>
            <PageView
              isDesignMode={true}
              isNoPermissionCheck={true}
              metaVertex={graph.vertexes[formStoreVertex()?.P.formDataId!]}
            />
          </DroppableWrapper>
        </DesignerFormIdContext.Provider>
      </DesignerLayoutStoreContext.Provider>
    </Show>
  );
}

function DroppableWrapper(props: { children: any; formStoreId: string }) {
  const [graph, setGraph] = useGraph();
  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const queryParams = new URLSearchParams(window.location.search);
  const noMinHeight = queryParams.get("noMinHeight") === "true";
  // const { showErrorToast } = useToast();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId] as Vertex<FormStoreObject>;

  return (
    <div
      class={noMinHeight ? undefined : "min-h:300px"}
      classList={{
        "bg:#f3f3f4": isDraggingOver(),
      }}
      onDragLeave={() => {
        setIsDraggingOver(false);
      }}
      onDragOver={(e) => {
        e.preventDefault(); // Allow drop
        setIsDraggingOver(true);
      }}
      onDrop={async (e) => {
        setIsDraggingOver(false);
        mergeVertexProperties<PageLayoutObject>(
          0,
          layoutStoreId,
          graph,
          setGraph,
          {
            activeItem: formStoreVertex()?.P.formDataId,
            position: "center",
          },
        );

        await handleDrop(
          e,
          layoutStoreVertex(),
          formStoreVertex(),
          graph,
          setGraph,
          // showErrorToast
          (error) => console.error(error),
        );
        resetDragDropState(layoutStoreVertex(), graph, setGraph);
      }}
    >
      {props.children}
    </div>
  );
}
