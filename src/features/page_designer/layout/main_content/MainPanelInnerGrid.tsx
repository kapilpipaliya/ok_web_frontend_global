import { createMemo, createSignal, Show, type ParentProps } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import {
  createPanelResizeHandler,
  DesignerPanel,
} from "~/features/page_designer/layout/DesignerPanel";
import { useResizeOverlay } from "~/lib/resizable/ResizeOverlayContext";
import { LayoutTreePanel } from "~/features/page_designer/settings/LayoutTreePanel";
import {
  INITIAL_WIDTHS,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { PropertiesContent } from "./PropertiesContent";
import { As } from "~/components/As";
import { STYLES } from "~/pages/settings/constants";
import type { Id } from "~/lib/graph/type/id";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function MainPanelInnerGrid(props: ParentProps<{ mainPanel: Id }>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const activeOpenedFormId = createMemo(() => {
    const layout = layoutStore();
    const tabKey = `mainPanel${props.mainPanel}Tab` as keyof PageLayoutObject;
    const activeFormStoreId = (layout as Record<string, unknown>)[tabKey];
    return layout.openedFormIds.find(
      (id) =>
        graph.vertexes[id]?.P?.mainPanel === props.mainPanel &&
        graph.vertexes[id]?.P?.formId === activeFormStoreId,
    );
  });

  const formStoreId = () =>
    graph.vertexes[activeOpenedFormId()!]?.P?.formId as Id;
  const formStore = () => graph.vertexes[formStoreId()]?.P as FormStoreObject;

  const { setResizing } = useResizeOverlay();
  const [activeResizeKey, setActiveResizeKey] = createSignal<null | string>(
    null,
  );
  const [layoutTreePanelRef, setLayoutTreePanelRef] =
    createSignal<HTMLDivElement>();
  const [propertiesPanelRef, setPropertiesPanelRef] =
    createSignal<HTMLDivElement>();

  const getGridTemplateColumns = () => {
    const layout = layoutStore();
    const columns: string[] = [];

    if (!activeOpenedFormId()) {
      columns.push("minmax(0, 1fr)");
      return columns.join(" ");
    }

    const store = formStore();

    if (layout.isLayoutTreeOpen) {
      columns.push(`${store?.layoutTreeWidth ?? INITIAL_WIDTHS.layoutTree}px`);
    }

    if (layout.isPropertiesOpen) {
      columns.push(`${store?.propertiesWidth ?? INITIAL_WIDTHS.properties}px`);
    }

    columns.push("minmax(0, 1fr)");
    return columns.join(" ");
  };

  const createResizeHandler = (key: "layoutTreeWidth" | "propertiesWidth") =>
    createPanelResizeHandler<FormStoreObject>(
      key,
      formStoreId,
      graph,
      setGraph,
      key === "layoutTreeWidth" ? layoutTreePanelRef : propertiesPanelRef,
      setResizing,
      setActiveResizeKey,
    );

  return (
    <>
      <As
        as="div"
        css={`return \`._id {
          display: grid;
          grid-template-columns: ${getGridTemplateColumns()};
          height: 100%;
          min-height: 0;
          min-width: 0;
          overflow: hidden;
        }\`;`}
      >
        <Show
          when={
            layoutStore().isLayoutTreeOpen &&
            activeOpenedFormId() &&
            formStore()
          }
        >
          <As as="div" css={STYLES.panelCellCss}>
            <DesignerPanel
              activeResizeKey={activeResizeKey()}
              onResize={createResizeHandler("layoutTreeWidth")}
              ref={setLayoutTreePanelRef}
              resizeKey="layoutTreeWidth"
              resizePosition="right"
            >
              <LayoutTreePanel openedFormId={activeOpenedFormId()!} />
            </DesignerPanel>
          </As>
        </Show>

        <Show
          when={
            layoutStore().isPropertiesOpen &&
            activeOpenedFormId() &&
            formStore()
          }
        >
          <As as="div" css={STYLES.panelCellCss}>
            <DesignerPanel
              activeResizeKey={activeResizeKey()}
              onResize={createResizeHandler("propertiesWidth")}
              ref={setPropertiesPanelRef}
              resizeKey="propertiesWidth"
              resizePosition="right"
            >
              <PropertiesContent openedFormId={activeOpenedFormId()!} />
            </DesignerPanel>
          </As>
        </Show>

        <As
          as="div"
          css={`return \`._id {
            min-width: 0;
            min-height: 0;
            height: 100%;
            overflow: auto;
          }\`;`}
        >
          {props.children}
        </As>
      </As>
    </>
  );
}
