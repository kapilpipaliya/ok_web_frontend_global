import { createStore } from 'solid-js/store';
import { useGraph, Vertex } from '~/lib/graph/graph';
import { PageView } from "~/components/page_attr_render/PageView";
import { DesignerLayoutStoreContext, PageLayoutObject, useDesignerLayoutStore } from '~/components/page_designer/context/LayoutContext';
import { Show, createSignal } from 'solid-js';
import { getChannel, handleChannelMessage } from '~/components/page_designer/layout/channel';
import { FormStoreObject } from '~/components/form/FormContext';
import { handleDrop } from '~/components/page_designer/event_handler/handleDrop';
import { mergeVertexProperties } from '~/lib/graph/mutate/vertex';
import { resetDragDropState } from '~/components/page_designer/event_handler/resetDragDropState';

function DropableWrapper(props: { children: any }) {
  const [graph, setGraph] = useGraph();
  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const layoutStoreId = useDesignerLayoutStore();
  // const { showErrorToast } = useToast();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  return (
    <div
      class="height:100vh"
      classList={{
        "bg:#f3f3f4": isDraggingOver(),
      }}
      onDragOver={(e) => {
        e.preventDefault(); // Allow drop
        setIsDraggingOver(true);
      }}
      onDragLeave={() => {
        setIsDraggingOver(false);
      }}
      onDrop={async (e) => {
        setIsDraggingOver(false);
        mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
          activeItem: formStoreVertex().P.formDataId,
          position: "center"
        });

        await handleDrop(
          e,
          layoutStoreId,
          graph,
          setGraph,
          // showErrorToast
          error => console.error(error)
        );
        resetDragDropState(layoutStoreId, graph, setGraph);
      }}
    >
      {props.children}
    </div>
  );
}

export default function PageShareView() {
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get('id');
  if (!id) {
    return <div>No id</div>;
  }

  const [graph, setGraph] = useGraph();

  const channel = getChannel(id);

  channel.onmessage = msg => handleChannelMessage(msg, graph, setGraph, id);

  const layoutStore = () => graph.vertexes[id]?.P as PageLayoutObject || {};
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  return (
    <Show when={formStoreVertex()}>
      <DesignerLayoutStoreContext.Provider value={id!}>
        <DropableWrapper>
          <PageView
            isDesignMode={true}
            isNoPermissionCheck={true}
            metaVertex={graph.vertexes[formStoreVertex().P.formDataId!]}
          />
        </DropableWrapper>
      </DesignerLayoutStoreContext.Provider>
    </Show>
  );
}
