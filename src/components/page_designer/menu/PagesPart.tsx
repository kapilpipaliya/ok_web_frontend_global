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
} from "solid-js";
import { useToast } from "~/components/Toast";
import { DraggedVertexContext, PageConfigContext, SelectedIdContext } from "~/lib/contexts";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/ws_events";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { Icon } from "@iconify-icon/solid";
import { LoaderNew } from "~/components/LoaderSimple";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { getTreeDataMGCall } from "~/cypher/get/getTreeDataMGCall";
import {CustomPopover} from "~/components/PopOver";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { onClickAddComponent } from "../CommonCompUtils";

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
  const [tooltip, setTooltip] = createSignal<HTMLElement | null>(null);
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
    const [isHovered, setIsHovered] = createSignal(false);
    const handleHover = (el: HTMLElement) => {
      setIsHovered(true);
      if (previewPageId() !== props.child.id) {
        setPreviewPageId(props.child.id);
      }
    };

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
      isHovered() ? { ...baseStyle, ...hoverStyle } : baseStyle;

    return (
      <Show when={props.child.name}>
        <CustomPopover
          isOpen={props.openPopoverId === props.child.id}
          setIsOpen={(isOpen) => props.setOpenPopoverId(isOpen ? props.child.id : null)}
          trigger={<div
            ref={el => setTooltip(el)}
            style={itemStyle()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setIsHovered(false);
              setPreviewPageId(null);
              setTooltip(null);
            }}
            draggable={true}
            onDragStart={(e) => {
              e.stopPropagation();
              setDraggedVertex([]);
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
          </div>
          }
          title={`${toTitle(props.child.name)} Preview`}
          description="This is a description inside the popover."
        ><PageViewWrapper formId={props.child.id} /></CustomPopover>
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
