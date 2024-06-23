import { toTitle } from "case-switcher-js";
import {
  Match,
  createEffect,
  createResource,
  createSignal,
  useContext,
  For,
  Switch,
  Show,
  onCleanup,
  onMount,
} from "solid-js";
import { useToast } from "~/components/Toast";
import { DraggedVertexContext, PageConfigContext, SelectedIdContext } from "~/lib/contexts";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { Icon } from "@iconify-icon/solid";
import { LoaderNew } from "~/components/LoaderSimple";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { getTreeDataMGCall } from "~/cypher/get/getTreeDataMGCall";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { onClickAddComponent } from "../CommonCompUtils";
import { Portal } from "solid-js/web";

export function PagesPart(props: { coll: string }) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [pageConfig, setPageConfig] = useContext(PageConfigContext) || [];
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  const { showErrorToast } = useToast();
  let originalData: any[] = [];
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal<any[]>([]);
  const [previewPageId, setPreviewPageId] = createSignal<Id | null>(null);
  const [hoverPageId, setHoverPageId] = createSignal<Id | null>(null);
  const [openPopoverId, setOpenPopoverId] = createSignal<Id | null>(null);
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );
  // Fetch data function
  async function fetchData(): Promise<{
    graph?: any;
    data?: any;
    error?: string;
  }> {
    try {
      const data = await getTreeDataMGCall({
        collection: paginationExpression({ coll: props.coll }),
      });
      return { graph: data.graph, data: data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Create a resource for data fetching
  const [data] = createResource(fetchData);

  // Create effect to handle data changes
  createEffect(() => {
    setIsFetchingData(true);
    if (data()) {
      const result = data();
      if (result?.error) {
        showErrorToast(result.error);
      } else {
        if (result?.graph) {
          setGraphData(graph, setGraph, result.graph);

          const data2 = getTreeData(graph, setGraph, {
            collection: paginationExpression({ coll: props.coll }),
          });
          originalData = data2;
          setFilteredData(data2);
          setIsFetchingData(false);
        }
      }
    }
  });

  // Update filtered data based on search query
  const updateFilteredData = () => {
    if (!searchQuery()) {
      setFilteredData(originalData);
    } else {
      const filtered = originalData.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery().toLowerCase()),
      );
      setFilteredData(filtered);
    }
  };

  function ListItemComponent(props: { child: any, openPopoverId: Id | null, setOpenPopoverId: (id: Id | null) => void }) {

    let menuRef: HTMLDivElement;

    const baseStyle = {
      "border-radius": ".2rem",
      margin: "5px",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      padding: "10px",
      "background-color": "white",
      display: "flex",
      "flex-direction": "row",
      "align-items": "center",
      gap: "10px",
      height: "35px",
      "box-shadow": "rgba(0, 0, 0, 0.2) 0px 0px 5px 0px",
    };

    const hoverStyle = {
      "background-color": "#F2EDED",
      cursor: "move",
      boxShadow: "4px 4px 4px",
    };

    const itemStyle: any = () =>
      hoverPageId() === props.child.id ? { ...baseStyle, ...hoverStyle } : baseStyle;

    const PreviewMenu = () => {
      let dropdownRef: HTMLDivElement;
      let resizeObserver: ResizeObserver;
      const handleResize = () => {
        const menuEntryRect = menuRef!.getBoundingClientRect();
        const menuEntryBottom = menuEntryRect.bottom;
        const menuEntryLeft = menuEntryRect.left;
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        dropdownRef!.style.top = `${menuEntryBottom + scrollY}px`;
        dropdownRef!.style.left = `${menuEntryLeft + scrollX}px`;
      }
      onMount(() => {
        handleResize();
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(dropdownRef!);
      });

      onCleanup(() => {
        resizeObserver?.disconnect();
      });

      return (
        <Portal mount={document.body}>
          <div
            ref={dropdownRef!}
            // used inline style because master css is not working!
            style={{
              position: "absolute",
              padding: "0.25rem",
              "max-height": "13rem",
              "overflow-y": "auto",
              "box-shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              "z-index": "999",
              "background-color": "white",
              "border": "1px solid #D1D5DB",
              "display": "flex",
              "flex-direction": "column",
              gap: "0.25rem",
              "align-items": "flex-start",
              "min-width": "12rem"
            }}
            onMouseLeave={() => setPreviewPageId(null)}
          >
            {toTitle(props.child.name)} Preview
            <PageViewWrapper formId={props.child.id} />
          </div>
        </Portal>
      );
    };

    let timeoutId: NodeJS.Timeout;
    return (
      <Show when={props.child.name}>
        <div
          ref={menuRef!}
          class="relative"
          style={itemStyle()}
          onMouseEnter={() => {
            if (previewPageId() !== props.child.id) {
              setPreviewPageId(null);
            }
            setHoverPageId(props.child.id);
            timeoutId = setTimeout(() => {
              setPreviewPageId(props.child.id);
            }, 1000);
          }}
          onMouseLeave={() => {
            clearTimeout(timeoutId);

            setHoverPageId(null);
          }}
          draggable={true}
          onDragStart={(e) => {
            e.stopPropagation();
            setDraggedVertex([]);
            clearTimeout(timeoutId);
            setPreviewPageId(null);
            const dataTransfer =
              selectedComponents().size > 0
                ? Array.from(selectedComponents())
                : [graph.vertexes[props.child.id]];
            setDraggedVertex((prev) => [...prev, ...dataTransfer]);
            setSelectedComponents(new Set<Vertex>());
          }}
          ondblclick={(e) => {
            setDraggedVertex([graph.vertexes[props.child.id]]);
            onClickAddComponent(
              graph,
              setGraph,
              pageConfig.formData.txnId,
              draggedVertex()[0],
              pageConfig.formData || {},
              selectedId() !== -1
                ? selectedId()
                : pageConfig.formData.formData.id,
            );
            setDraggedVertex([]);
          }}
        >
          <Icon icon={"iconoir:multiple-pages"} height={22} width={22} />
          <div style={{ "font-size": "14px" }}>{toTitle(props.child.name)}</div>
          <Show when={previewPageId() === props.child.id}>
            <PreviewMenu />
          </Show>
        </div>

      </Show>
    );
  }

  return (
    <Switch fallback={<LoaderNew loaderHeight="55vh" />}>
      <Match when={data.error}>Error: {data.error}</Match>
      <Match when={!isFetchingData()}>
        <>
          <nav class="bg:white p:5 position:sticky abs z:10">
            <div class="group">
              <Icon
                class="icon"
                icon="iconamoon:search"
                style={{ color: "#9e9ea7" }}
              />
              <input
                placeholder={`Search ${props.coll}...`}
                type="search"
                class="inputSearch f:14"
                value={searchQuery()}
                onInput={(e) => {
                  setSearchQuery(e.target.value);
                  updateFilteredData(); // Update filteredData when searchQuery changes
                }}
              />
            </div>
          </nav>
          <div
            class="overflow:auto h:full grid"
            style={{
              "scrollbar-width": "thin",
              "scrollbar-color": "lightgrey",
            }}
          >
            <For
              each={filteredData()}
              fallback={
                <div class="p:3 m:20px|0px font-weight:bold text-align:center">
                  No {props.coll} Found!
                </div>
              }
            >
              {(item, index) => <ListItemComponent child={item} openPopoverId={openPopoverId()} setOpenPopoverId={setOpenPopoverId} />}
            </For>
          </div>
        </>
      </Match>
    </Switch>
  );
}
