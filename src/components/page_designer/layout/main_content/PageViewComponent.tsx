import { For, Show } from "solid-js";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { ResizableContainer } from "~/components/styled/ResizableDivView";
import { Id, useGraph, Vertex } from "~/lib/graph/graph";
import { useDesignerLayoutStore, PageLayoutObject } from "../../context/LayoutContext";
import { IFramePreview } from "../IFramePreview";
import { PageTabBar } from "./PageTabBar";

export function PageViewComponent(props: {mainPanel: Id}) {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  return (
    <div class="flex gap:8 flex:nowrap">
      <For each={layoutStore().openedFormIds.filter(id => graph.vertexes[id].P.mainPanel === props.mainPanel)}>
        {(openedFormId) => {
          const isActive = () => layoutStore()[`mainPanel${props.mainPanel}Tab`] === graph.vertexes[openedFormId].P.formId;
          const formStoreVertex = () => graph.vertexes[graph.vertexes[openedFormId].P.formId] as Vertex<FormStoreObject>;

          return (
            <Show when={formStoreVertex()?.id}>
              <For each={formStoreVertex()?.P.openedViews}>
                {(openedView, index) => (
                  <ResizableContainer
                    view={openedView}
                    class={isActive() ? '' : 'hidden'}
                  >
                    <PageTabBar formStoreId={graph.vertexes[openedFormId].P.formId} openIndex={index()} />
                    <IFramePreview formStoreId={graph.vertexes[openedFormId].P.formId} />
                    {/* <PageView
                                  isDesignMode={true}
                                  isNoPermissionCheck={true}
                                  metaVertex={graph.vertexes[vertex()?.P.formDataId!]}
                                /> */}
                  </ResizableContainer>
                )}
              </For>
            </Show>
          );
        }}
      </For>
    </div>
  );
}
