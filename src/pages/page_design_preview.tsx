import { createStore } from 'solid-js/store';
import { useGraph, Vertex } from '~/lib/graph/graph';
import { PageView } from "~/components/page_attr_render/PageView";
import { DesignerLayoutStoreContext, getInitialDesignerLayoutStore, PageLayoutObject, useDesignerLayoutStore } from '~/components/page_designer/context/LayoutContext';
import { Show } from 'solid-js';
import { channel, getChannel, handleChannelMessage } from '~/components/page_designer/layout/channel';
import { FormStoreObject } from '~/components/form/FormContext';

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
        <PageView
          isDesignMode={true}
          isNoPermissionCheck={true}
          metaVertex={graph.vertexes[formStoreVertex().P.formDataId!]}
        />
      </DesignerLayoutStoreContext.Provider>
    </Show>
  );
}
