import { createSignal, For, Show } from "solid-js";

import { ResizeOverlay } from "~/components/styled/ResizeOverlay";
import { useDesignerLayoutStore } from "~/features/page_designer/context/LayoutContext";
import { SettingTabs } from "~/features/page_designer/settings/SettingTabs";
import { GraphView } from "~/pages/debug/GraphView";
import { STYLES } from "~/pages/settings/constants";

import type { PageLayoutObject } from "../context/LayoutContext";
import { MIN_MAIN_PANEL_ROW_HEIGHT } from "../context/LayoutContext";

import { UseObjectAIPanel } from "../chat/use-object/UseObjectAIPanel";
import {
  createMainPanelRowWidthResizeHandler,
  createPanelRowHeightResizeHandler,
  createPanelResizeHandler,
  DesignerPanel,
} from "./DesignerPanel";
import {
  DESIGNER_RESIZE_TRACK_SIZE,
  DesignerResizeHandle,
} from "./resizable/DesignerResizeHandle";
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
import type { Id } from "~/lib/graph/type/id";

export function RenderMainContent() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const getSidebarGridTemplateColumns = () => {
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

    columns.push("minmax(0, 1fr)");
    return columns.join(" ");
  };

  const getRowGridColumns = (rowIndex: 0 | 1) => {
    const layout = layoutStore();
    const panels = layout.mainPanelRows[rowIndex];
    const rowWidth = (layout as Record<string, unknown>)[
      `mainPanelRow${rowIndex}Width`
    ];
    if (typeof rowWidth === "number") {
      return panels.map(() => `${rowWidth}px`).join(" ");
    }
    return panels.map(() => "1fr").join(" ");
  };

  const getRowInnerGridCss = (rowIndex: 0 | 1) => {
    const rowWidth = (layoutStore() as Record<string, unknown>)[
      `mainPanelRow${rowIndex}Width`
    ];
    if (typeof rowWidth === "number") {
      return "width: max-content; min-width: 100%;";
    }
    return "width: 100%; min-width: 0;";
  };

  const hasAnyFixedRowHeight = () => {
    const layout = layoutStore();
    return (
      layout.mainPanelRow0Height != null || layout.mainPanelRow1Height != null
    );
  };

  const getOuterGridHeightCss = () =>
    hasAnyFixedRowHeight()
      ? "min-height: 100%; height: auto;"
      : "height: 100%; min-height: 100%;";

  const getMainAreaHeightCss = () =>
    hasAnyFixedRowHeight()
      ? "height: auto; min-height: 100%;"
      : "height: 100%; min-height: 0;";

  const getMainRowsTemplate = () => {
    const layout = layoutStore();
    const row0Css = layout.mainPanelRow0Height
      ? `${layout.mainPanelRow0Height}px`
      : layout.mainPanelRow1Height != null
        ? `minmax(${MIN_MAIN_PANEL_ROW_HEIGHT}px, auto)`
        : "0.8fr";
    const row1Css = layout.mainPanelRow1Height
      ? `${layout.mainPanelRow1Height}px`
      : layout.mainPanelRow0Height != null
        ? `minmax(${MIN_MAIN_PANEL_ROW_HEIGHT}px, auto)`
        : "1fr";
    return `${row0Css} ${DESIGNER_RESIZE_TRACK_SIZE}px ${row1Css} ${DESIGNER_RESIZE_TRACK_SIZE}px`;
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

  const [mainPanelRow0Ref, setMainPanelRow0Ref] =
    createSignal<HTMLDivElement>();
  const [mainPanelRow1Ref, setMainPanelRow1Ref] =
    createSignal<HTMLDivElement>();
  const [showGraphView, setShowGraphView] = createSignal(false);

  const createRowWidthResizeHandler = (
    rowIndex: 0 | 1,
    panelRef: () => HTMLDivElement | undefined,
    growOnDragRight?: boolean,
  ) =>
    createMainPanelRowWidthResizeHandler(
      rowIndex,
      layoutStoreId,
      graph,
      setGraph,
      panelRef,
      setIsResizing,
      setActiveResizeKey,
      growOnDragRight,
    );

  const handleRow0HeightResize = createPanelRowHeightResizeHandler(
    "mainPanelRow0Height",
    layoutStoreId,
    graph,
    setGraph,
    mainPanelRow0Ref,
    setIsResizing,
    setActiveResizeKey,
    MIN_MAIN_PANEL_ROW_HEIGHT,
  );

  const handleRow1HeightResize = createPanelRowHeightResizeHandler(
    "mainPanelRow1Height",
    layoutStoreId,
    graph,
    setGraph,
    mainPanelRow1Ref,
    setIsResizing,
    setActiveResizeKey,
    MIN_MAIN_PANEL_ROW_HEIGHT,
  );

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

  const renderMainPanelContent = (mainPanel: Id) => (
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
        overflow-y: auto;
      }\`;`,
        ]}
      >
        <As
          as="div"
          css={`return \`._id {
          display: grid;
          grid-template-columns: ${getSidebarGridTemplateColumns()};
          width: max-content;
          min-width: 100%;
          ${getOuterGridHeightCss()}
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

          <As
            as="div"
            css={`return \`._id {
              display: grid;
              grid-template-rows: ${getMainRowsTemplate()};
              ${getMainAreaHeightCss()}
              width: max-content;
              min-width: 100%;
            }\`;`}
          >
            <As
              as="div"
              css={`return \`._id {
                min-height: 0;
                overflow: hidden;
              }\`;`}
              ref={setMainPanelRow0Ref}
            >
              <As
                as="div"
                css={`return \`._id {
                    display: grid;
                    grid-template-columns: ${getRowGridColumns(0)};
                    height: 100%;
                    ${getRowInnerGridCss(0)}
                  }\`;`}
              >
                  <For each={layoutStore().mainPanelRows[0]}>
                    {(mainPanel) => (
                      <As as="div" css={STYLES.panelCellCss}>
                        <DesignerPanel
                          activeResizeKey={activeResizeKey()}
                          isResizing={isResizing()}
                          onResizeLeft={createRowWidthResizeHandler(
                            0,
                            () => mainPanelRefs()[`mainPanel${mainPanel}`],
                            false,
                          )}
                          onResizeRight={createRowWidthResizeHandler(
                            0,
                            () => mainPanelRefs()[`mainPanel${mainPanel}`],
                            true,
                          )}
                          ref={(el: HTMLDivElement) =>
                            setMainPanelRefs((prev) => ({
                              ...prev,
                              [`mainPanel${mainPanel}`]: el,
                            }))
                          }
                          resizeKey="mainPanelRow0Width"
                          resizeKeyLeft="mainPanelRow0Width"
                          resizeKeyRight="mainPanelRow0Width"
                          scrollContent={false}
                        >
                          {renderMainPanelContent(mainPanel)}
                        </DesignerPanel>
                      </As>
                    )}
                  </For>
                </As>
              </As>

              <DesignerResizeHandle
                active={activeResizeKey() === "mainPanelRow0Height"}
                axis="y"
                onPointerDown={handleRow0HeightResize}
              />

              <As
                as="div"
                css={`return \`._id {
                  min-height: 0;
                  overflow: hidden;
                }\`;`}
                ref={setMainPanelRow1Ref}
              >
                <As
                  as="div"
                  css={`return \`._id {
                    display: grid;
                    grid-template-columns: ${getRowGridColumns(1)};
                    height: 100%;
                    ${getRowInnerGridCss(1)}
                  }\`;`}
                >
                  <For each={layoutStore().mainPanelRows[1]}>
                    {(mainPanel) => (
                      <As as="div" css={STYLES.panelCellCss}>
                        <DesignerPanel
                          activeResizeKey={activeResizeKey()}
                          isResizing={isResizing()}
                          onResizeLeft={createRowWidthResizeHandler(
                            1,
                            () => mainPanelRefs()[`mainPanel${mainPanel}`],
                            false,
                          )}
                          onResizeRight={createRowWidthResizeHandler(
                            1,
                            () => mainPanelRefs()[`mainPanel${mainPanel}`],
                            true,
                          )}
                          ref={(el: HTMLDivElement) =>
                            setMainPanelRefs((prev) => ({
                              ...prev,
                              [`mainPanel${mainPanel}`]: el,
                            }))
                          }
                          resizeKey="mainPanelRow1Width"
                          resizeKeyLeft="mainPanelRow1Width"
                          resizeKeyRight="mainPanelRow1Width"
                          scrollContent={false}
                        >
                          {renderMainPanelContent(mainPanel)}
                        </DesignerPanel>
                      </As>
                    )}
                  </For>
                </As>
              </As>

              <DesignerResizeHandle
                active={activeResizeKey() === "mainPanelRow1Height"}
                axis="y"
                onPointerDown={handleRow1HeightResize}
              />
          </As>
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
