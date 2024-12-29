import { BroadcastChannel } from 'broadcast-channel';
import { createStore, reconcile } from 'solid-js/store';
import { useGraph } from '~/lib/graph/graph';
import { PageView } from "~/components/page_attr_render/PageView";
import { DesignerLayoutStoreContext, getInitialDesignerLayoutStore } from '~/components/page_designer/context/LayoutContext';
import { Show } from 'solid-js';

export default function PageShareView() {
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get('id');
  console.log(id);
  const [graph, setGraph] = useGraph();
  const pageDesignerStore = createStore(getInitialDesignerLayoutStore());
  const [layoutStore, setLayoutStore] = pageDesignerStore;
  const channel = new BroadcastChannel('foobar');
  channel.onmessage = msg => {
    const data = JSON.parse(msg);
    if (data.graph) {
      setGraph(reconcile(graph, data.graph));
    }
    if (data.layoutStore) {
      setLayoutStore(reconcile(data.layoutStore));
    }
  };


  return (
    <Show when={layoutStore.formStore?.[0]}>
      <DesignerLayoutStoreContext.Provider value={pageDesignerStore}>
        <PageView
          isDesignMode={true}
          isNoPermissionCheck={true}
          metaVertex={graph.vertexes[layoutStore.formStore[0]?.formDataId!]}
        />
      </DesignerLayoutStoreContext.Provider>
    </Show>
  );
}
