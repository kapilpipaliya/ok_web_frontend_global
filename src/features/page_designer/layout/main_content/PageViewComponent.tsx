import { createSignal, For, Show, createEffect, type Accessor } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { ResizableContainer } from "~/components/styled/ResizableDivView";
import { STYLES } from "~/pages/settings/constants";

import {
  DesignerFormIdContext,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { FunctionEditor } from "../../settings/properties/FunctionEditor";
import { IFramePreview } from "../IFramePreview";
import { MainPanelInnerGrid } from "./MainPanelInnerGrid";
import { PageTabBar } from "./PageTabBar";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

function OpenedViewPanel(props: {
  formStoreId: Id;
  handleClose: () => void;
  handleRefresh: () => void;
  highlightedViewId: Accessor<Id | null>;
  index: number;
  isActive: Accessor<boolean>;
  isPreview: Accessor<boolean>;
  openedViewId: Id;
  previewsLength: number;
}) {
  const isHighlighted = () => props.highlightedViewId() === props.openedViewId;

  const [viewRef, setViewRef] = createSignal<HTMLDivElement>();

  createEffect(() => {
    const el = viewRef();
    if (isHighlighted() && el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      // When a view is highlighted, also scroll its parent container to the top
      // to ensure the view is fully visible
      if (el.parentElement?.parentElement) {
        el.parentElement.parentElement.scrollTop = 0;
      }
    }
  });

  return (
    <As
      as="div"
      css={
        props.isActive()
          ? `return \`._id {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          min-width: 0;
          min-height: 0;
          height: 100%;
          ${props.previewsLength === 1 ? "flex: 1;" : ""}
        }\`;`
          : "return `._id {display: none;}`;"
      }
      ref={setViewRef}
    >
      <As as="div" css={"return `._id { flex-shrink: 0; }`;"}>
        <PageTabBar
          formStoreId={props.formStoreId}
          handleRefresh={props.handleRefresh}
          onClose={props.handleClose}
          openIndex={props.index}
          previewsLength={props.previewsLength}
        />
      </As>
      <As
        as="div"
        css={[
          STYLES.overflowCss,
          `return \`._id {
            flex: 1;
            min-height: 0;
            min-width: 0;
          }\`;`,
        ]}
      >
        <ResizableContainer
          view={props.openedViewId}
          css={
            isHighlighted()
              ? [
                  `return \`._id {
                          border: 3px solid \${t.var.color.primary};
                          animation: borderPulse 1.5s infinite alternate;
                        }\`;`,
                  `return \`@keyframes borderPulse {
                            from { border-color: \${t.var.color.primary_light_300}; }
                            to { border-color: \${t.var.color.primary}; }
                          }\`;`,
                ]
              : ""
          }
        >
          <Show when={props.isPreview()}>
            <IFramePreview formStoreId={props.formStoreId} />
          </Show>
        </ResizableContainer>
      </As>
    </As>
  );
}

export function PageViewComponent(props: { mainPanel: Id }) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const [isPreview, setIsPreview] = createSignal(true);
  const [highlightedViewId, setHighlightedViewId] = createSignal<Id | null>(
    null,
  );

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

  // Check for newly added views and highlight them
  createEffect(() => {
    const openedFormIds = layoutStore().openedFormIds.filter(
      (id) => graph.vertexes[id].P.mainPanel === props.mainPanel,
    );

    for (const openedFormId of openedFormIds) {
      const formStoreVertex = graph.vertexes[
        graph.vertexes[openedFormId].P.formId
      ] as Vertex<FormStoreObject>;

      if (formStoreVertex?.P.lastAddedViewId) {
        setHighlightedViewId(formStoreVertex.P.lastAddedViewId);

        // Reset the lastAddedViewId after a short delay
        setTimeout(() => {
          mergeVertexProperties<FormStoreObject>(
            0,
            formStoreVertex.id,
            graph,
            setGraph,
            {
              lastAddedViewId: null,
            },
          );
          // Keep highlight effect a bit longer than tracking
          setTimeout(() => {
            setHighlightedViewId(null);
          }, 2000);
        }, 500);

        break;
      }
    }
  });

  return (
    <MainPanelInnerGrid mainPanel={props.mainPanel}>
      <As
        as="div"
        css={[
          STYLES.overflowCss,
          `return \`._id {
            display: flex;
            gap: 0;
            flex-wrap: nowrap;
            height: 100%;
            min-height: 0;
            min-width: 0;
            align-items: flex-start;
          }\`;`,
        ]}
      >
        <For
          each={layoutStore().openedFormIds.filter(
            (id) => graph.vertexes[id].P.mainPanel === props.mainPanel,
          )}
        >
          {(openedFormId) => {
            const isActive = () => {
              // Type assertion for dynamic property access
              const key =
                `mainPanel${props.mainPanel}Tab` as keyof PageLayoutObject;
              // Using type assertion as a workaround for the dynamic property access
              const layoutStoreValue = layoutStore() as Record<string, unknown>;
              return (
                layoutStoreValue[key] === graph.vertexes[openedFormId].P.formId
              );
            };
            const formStoreVertex = () =>
              graph.vertexes[
                graph.vertexes[openedFormId].P.formId
              ] as Vertex<FormStoreObject>;

            const openFormLabel = () =>
              (graph.vertexes[openedFormId].P.label as string) || "";
            const isFunctionForm = () => openFormLabel() === "Function";
            const formDataId = () => formStoreVertex()?.P.formDataId as Id;

            return (
              <Show when={formStoreVertex()?.id}>
                <Show
                  when={!isFunctionForm()}
                  fallback={
                    <As
                      as="div"
                      css={
                        isActive()
                          ? `return \`._id {
                          display: flex;
                          flex-direction: column;
                          flex: 1;
                          min-width: 0;
                          min-height: 0;
                          height: 100%;
                        }\`;`
                          : "return `._id {display: none;}`;"
                      }
                    >
                      <As as="div" css={"return `._id { flex-shrink: 0; }`;"}>
                        <PageTabBar
                          formStoreId={graph.vertexes[openedFormId].P.formId}
                          handleRefresh={handleRefresh}
                          onClose={() => {}}
                          openIndex={0}
                          previewsLength={1}
                        />
                      </As>
                      <As
                        as="div"
                        css={[
                          STYLES.verticalOverflowCss,
                          `return \`._id {
                          flex: 1;
                          min-height: 0;
                          padding: 12px;
                        }\`;`,
                        ]}
                      >
                        <DesignerFormIdContext.Provider
                          value={graph.vertexes[openedFormId].P.formId}
                        >
                          <FunctionEditor
                            keyName="body"
                            label="body"
                            language="javascript"
                            returnType="object"
                            setPropertyValue={(meta, value) => {
                              const key = (meta.P?.key as string) ?? "body";
                              const dataVertex = graph.vertexes[
                                formDataId()
                              ] as Vertex;
                              const formStore = formStoreVertex();
                              if (!(dataVertex && formStore)) return;

                              // Use transaction-aware helper so Save button picks up changes
                              setValueGlobal(
                                graph,
                                setGraph,
                                formStore.P.txnId,
                                { P: { key } } as unknown as Vertex,
                                dataVertex,
                                value,
                                false,
                              );
                            }}
                            vertexId={formDataId()}
                          />
                        </DesignerFormIdContext.Provider>
                      </As>
                    </As>
                  }
                >
                  <For each={formStoreVertex()?.P.openedViews}>
                    {(openedViewId, index) => (
                      <OpenedViewPanel
                        formStoreId={graph.vertexes[openedFormId].P.formId}
                        handleClose={() =>
                          handleClose(openedFormId, openedViewId)
                        }
                        handleRefresh={handleRefresh}
                        highlightedViewId={highlightedViewId}
                        index={index()}
                        isActive={isActive}
                        isPreview={isPreview}
                        openedViewId={openedViewId}
                        previewsLength={
                          formStoreVertex()?.P.openedViews.length ?? 0
                        }
                      />
                    )}
                  </For>
                </Show>
              </Show>
            );
          }}
        </For>
      </As>
    </MainPanelInnerGrid>
  );
}
