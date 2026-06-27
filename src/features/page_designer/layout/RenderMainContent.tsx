import { createSignal, For, Show } from "solid-js";

import { ResizeOverlay } from "~/components/styled/ResizeOverlay";
import { useDesignerLayoutStore } from "~/features/page_designer/context/LayoutContext";
import { SettingTabs } from "~/features/page_designer/settings/SettingTabs";
import { GraphView } from "~/pages/debug/GraphView";
import { STYLES } from "~/pages/settings/constants";

import type { PageLayoutObject } from "../context/LayoutContext";

import { UseObjectAIPanel } from "../chat/use-object/UseObjectAIPanel";
import {
  createPanelResizeHandler,
  DesignerPanel,
} from "./DesignerPanel";
import { HeaderRow } from "../header/header_row/HeaderRow";
import { DeleteConfirmation } from "./main_content/DeleteConfirmation";
import { UnsavedTabSaveReminder } from "./UnsavedTabSaveReminder";
import {
  ComponentsPanelContent,
  FunctionsPanelContent,
  PagesPanelContent,
} from "./main_content/FormElements";
import { PageViewComponent } from "./main_content/PageViewComponent";
import { TabBar } from "./main_content/TabBar";
import { As } from "~/components/As";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function RenderMainContent() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const getGridTemplateColumns = () => {
    const layout = layoutStore();
    const columns: string[] = [];

    if (layout.isSettingsOpen) {
      columns.push(`${layout.settingsWidth}px`);
    }

    if (layout.isPagesOpen) {
      columns.push(`${layout.pagesWidth}px`);
    }

    if (layout.isComponentsOpen) {
      columns.push(`${layout.componentsWidth}px`);
    }

    if (layout.isFunctionsOpen) {
      columns.push(`${layout.functionsWidth}px`);
    }

    if (layout.isAiOpen) {
      columns.push(`${layout.aiWidth}px`);
    }

    if (layout.mainPanel) {
      const mainPanelColumns = layout.mainPanel.map((panel) => {
        const width = (layout as Record<string, unknown>)[
          `mainPanel${panel}Width`
        ];
        return typeof width === "number" ? `${width}px` : "minmax(400px, 1fr)";
      });
      columns.push(...mainPanelColumns);
    }

    return columns.join(" ");
  };

  const [isResizing, setIsResizing] = createSignal(false);
  const [activeResizeKey, setActiveResizeKey] = createSignal<null | string>(
    null,
  );
  const [componentsPanelRef, setComponentsPanelRef] =
    createSignal<HTMLDivElement>();
  const [pagesPanelRef, setPagesPanelRef] = createSignal<HTMLDivElement>();
  const [functionsPanelRef, setFunctionsPanelRef] =
    createSignal<HTMLDivElement>();
  const [aiPanelRef, setAiPanelRef] = createSignal<HTMLDivElement>();
  const [settingsPanelRef, setSettingsPanelRef] =
    createSignal<HTMLDivElement>();
  const [mainPanelRefs, setMainPanelRefs] = createSignal<{
    [key: string]: HTMLDivElement;
  }>({});

  const [showGraphView, setShowGraphView] = createSignal(false);

  const createResizeHandler = (
    key:
      | "componentsWidth"
      | "pagesWidth"
      | "functionsWidth"
      | "aiWidth"
      | "settingsWidth"
      | `mainPanel${string}Width`,
    panelRef: () => HTMLDivElement | undefined,
    growOnDragRight?: boolean,
  ) =>
    createPanelResizeHandler(
      key,
      layoutStoreId,
      graph,
      setGraph,
      panelRef,
      setIsResizing,
      setActiveResizeKey,
      growOnDragRight ??
        (key === "componentsWidth" ||
          key === "pagesWidth" ||
          key === "functionsWidth" ||
          key === "settingsWidth" ||
          key === "aiWidth" ||
          key.startsWith("mainPanel")),
    );

  return (
    <As
      as="div"
      css={`return \`._id {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100vh;
        overflow: hidden;
      }\`;`}
    >
      <HeaderRow
        css={`return \`._id {
          align-items: center;
          flex-shrink: 0;
        }}\`;`}
      />

      <As
        as="div"
        css={[
          STYLES.horizontalOverflowCss,
          `return \`._id {
        flex: 1;
        min-width: 0;
        min-height: 0;
      }\`;`,
        ]}
      >
        <As
          as="div"
          css={`return \`._id {
          display: grid;
          grid-template-columns: ${getGridTemplateColumns()};
          width: max-content;
          min-width: 100%;
          height: 100%;
        }\`;`}
        >
          <As
            as="div"
            css={STYLES.panelCellCss}
            style={{ display: layoutStore().isSettingsOpen ? "block" : "none" }}
          >
            <DesignerPanel
              activeResizeKey={activeResizeKey()}
              isResizing={isResizing()}
              onResize={createResizeHandler(
                "settingsWidth",
                settingsPanelRef,
                true,
              )}
              ref={setSettingsPanelRef}
              resizeKey="settingsWidth"
              resizePosition="right"
              title="Settings"
            >
              <SettingTabs />
            </DesignerPanel>
          </As>

          <As
            as="div"
            css={STYLES.panelCellCss}
            style={{ display: layoutStore().isPagesOpen ? "block" : "none" }}
          >
            <DesignerPanel
              activeResizeKey={activeResizeKey()}
              isResizing={isResizing()}
              onResize={createResizeHandler("pagesWidth", pagesPanelRef)}
              ref={setPagesPanelRef}
              resizeKey="pagesWidth"
              resizePosition="right"
              scrollContent={false}
              title="Pages"
              titleIcon="ph:file-text"
            >
              <PagesPanelContent />
            </DesignerPanel>
          </As>

          <As
            as="div"
            css={STYLES.panelCellCss}
            style={{
              display: layoutStore().isComponentsOpen ? "block" : "none",
            }}
          >
            <DesignerPanel
              activeResizeKey={activeResizeKey()}
              isResizing={isResizing()}
              onResize={createResizeHandler(
                "componentsWidth",
                componentsPanelRef,
              )}
              ref={setComponentsPanelRef}
              resizeKey="componentsWidth"
              resizePosition="right"
              scrollContent={false}
              title="Components"
              titleIcon="ph:puzzle-piece"
            >
              <ComponentsPanelContent />
            </DesignerPanel>
          </As>

          <As
            as="div"
            css={STYLES.panelCellCss}
            style={{
              display: layoutStore().isFunctionsOpen ? "block" : "none",
            }}
          >
            <DesignerPanel
              activeResizeKey={activeResizeKey()}
              isResizing={isResizing()}
              onResize={createResizeHandler(
                "functionsWidth",
                functionsPanelRef,
              )}
              ref={setFunctionsPanelRef}
              resizeKey="functionsWidth"
              resizePosition="right"
              scrollContent={false}
              title="Functions"
              titleIcon="ph:function"
            >
              <FunctionsPanelContent />
            </DesignerPanel>
          </As>

          <As
            as="div"
            css={STYLES.panelCellCss}
            style={{ display: layoutStore().isAiOpen ? "block" : "none" }}
          >
            <DesignerPanel
              activeResizeKey={activeResizeKey()}
              isResizing={isResizing()}
              onResize={createResizeHandler("aiWidth", aiPanelRef, true)}
              ref={setAiPanelRef}
              resizeKey="aiWidth"
              resizePosition="right"
              title="AI Content Generator"
            >
              <UseObjectAIPanel />
            </DesignerPanel>
          </As>

          <For each={layoutStore().mainPanel}>
            {(mainPanel) => (
              <As as="div" css={STYLES.panelCellCss}>
                <DesignerPanel
                  activeResizeKey={activeResizeKey()}
                  isResizing={isResizing()}
                  onResizeLeft={createResizeHandler(
                    `mainPanel${mainPanel}Width` as `mainPanel${string}Width`,
                    () => mainPanelRefs()[`mainPanel${mainPanel}`],
                    false,
                  )}
                  onResizeRight={createResizeHandler(
                    `mainPanel${mainPanel}Width` as `mainPanel${string}Width`,
                    () => mainPanelRefs()[`mainPanel${mainPanel}`],
                    true,
                  )}
                  ref={(el: HTMLDivElement) =>
                    setMainPanelRefs((prev) => ({
                      ...prev,
                      [`mainPanel${mainPanel}`]: el,
                    }))
                  }
                  resizeKey={`mainPanel${mainPanel}Width`}
                  resizeKeyLeft={`mainPanel${mainPanel}Width`}
                  resizeKeyRight={`mainPanel${mainPanel}Width`}
                  scrollContent={false}
                >
                  <As
                    as="div"
                    css={`return \`._id {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 0;
                    overflow: hidden;
                  }\`;`}
                  >
                    <As as="div" css={"return `._id { flex-shrink: 0; }`;"}>
                      <TabBar mainPanel={mainPanel} />
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
                      flex: 1;
                      min-height: 0;
                      overflow: hidden;
                    }\`;`}
                    >
                      <PageViewComponent mainPanel={mainPanel} />
                    </As>
                  </As>
                </DesignerPanel>
              </As>
            )}
          </For>
        </As>
      </As>

      <DeleteConfirmation />
      <UnsavedTabSaveReminder />
      <Show when={isResizing()}>
        <ResizeOverlay />
      </Show>
      <button
        onClick={() => setShowGraphView(!showGraphView())}
        style={{ display: "none" }}
      >
        Toggle GraphView
      </button>
      <Show when={showGraphView()}>
        <GraphView />
      </Show>
    </As>
  );
}

export default RenderMainContent;
