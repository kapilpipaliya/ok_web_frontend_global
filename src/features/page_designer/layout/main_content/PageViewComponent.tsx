import { createSignal, For, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { ResizableContainer } from "~/components/styled/ResizableDivView";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { IFramePreview } from "../IFramePreview";
import { PageTabBar } from "./PageTabBar";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function PageViewComponent(props: { mainPanel: Id }) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const [isPreview, setIsPreview] = createSignal(true);

  const handleRefresh = () => {
    // Toggle isPreview to force iframe refresh
    setIsPreview(false);
    setTimeout(() => {
      setIsPreview(true);
    }, 100);
  };

  const handleClose = (openedFormId: Id, openedViewId: Id) => {
    const formStore = graph.vertexes[graph.vertexes[openedFormId].P.formId]
      ?.P as FormStoreObject;
    if (!formStore?.openedViews) {
      return;
    }

    const updatedOpenedViews = formStore.openedViews.filter(
      (view) => view !== openedViewId,
    );

    mergeVertexProperties<FormStoreObject>(
      0,
      graph.vertexes[openedFormId].P.formId,
      graph,
      setGraph,
      {
        openedViews: updatedOpenedViews,
      },
    );
    // delete here will call PageViewWrapper onClenup and the UI gives error.
    // TODO: Fix this logic
    // deleteVertex(0, openedFormId, graph, setGraph);
  };

  return (
    <As
      as="div"
      css={css`
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
`}
    >
      <For
        each={layoutStore().openedFormIds.filter(
          (id) => graph.vertexes[id].P.mainPanel === props.mainPanel,
        )}
      >
        {(openedFormId) => {
          const isActive = () =>
            layoutStore()[`mainPanel${props.mainPanel}Tab`] ===
            graph.vertexes[openedFormId].P.formId;
          const formStoreVertex = () =>
            graph.vertexes[
              graph.vertexes[openedFormId].P.formId
            ] as Vertex<FormStoreObject>;

          return (
            <Show when={formStoreVertex()?.id}>
              <For each={formStoreVertex()?.P.openedViews}>
                {(openedViewId, index) => (
                  <As
                    as="div"
                    css={
                      isActive()
                        ? ""
                        : css`display: none;`
                  }>
                    <PageTabBar
                      formStoreId={graph.vertexes[openedFormId].P.formId}
                      handleRefresh={handleRefresh}
                      onClose={() => handleClose(openedFormId, openedViewId)}
                      openIndex={index()}
                      previewsLength={formStoreVertex()?.P.openedViews.length}
                    />
                    <ResizableContainer
                      view={openedViewId}
                    >
                      <Show when={isPreview()}>
                        <IFramePreview
                          formStoreId={graph.vertexes[openedFormId].P.formId}
                        />
                      </Show>
                      {/* <PageView
                                  isDesignMode={true}
                                  isNoPermissionCheck={true}
                                  metaVertex={graph.vertexes[vertex()?.P.formDataId!]}
                                /> */}
                    </ResizableContainer>
                  </As>
                )}
              </For>
            </Show>
          );
        }}
      </For>
    </As>
  );
}
