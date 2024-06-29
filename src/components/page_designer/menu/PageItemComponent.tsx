import { toTitle } from "case-switcher-js";
import {
  createSignal,
  useContext, Show
} from "solid-js";
import { DraggedVertexContext, PageConfigContext, SelectedIdContext } from "~/lib/contexts";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";
import type { NavItem } from "~/lib/graph/get/sync/traverse";
import { Icon } from "@iconify-icon/solid";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { onClickAddComponent } from "~/lib/drag_drop/onClickAddComponent";
import { DropdownMenu } from "~/components/DropdownMenu";

export function PageItemComponent(props: Readonly<{ child: NavItem; previewPageId: Id | null, setPreviewPageId: (id: Id | null) => void }>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [selectedId,] = useContext(SelectedIdContext);
  const [pageConfig,] = useContext(PageConfigContext) || [];
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  const [hoverPageId, setHoverPageId] = createSignal<Id | null>(null);
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>()
  );

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

  const itemStyle: any = () => hoverPageId() === props.child.id ? { ...baseStyle, ...hoverStyle } : baseStyle;

  let timeoutId: NodeJS.Timeout;
  return (
    <Show when={props.child.name}>
      <div
        ref={menuRef!}
        class="relative"
        style={itemStyle()}
        onMouseEnter={() => {
          if (props.previewPageId !== props.child.id) {
            props.setPreviewPageId(null);
          }
          setHoverPageId(props.child.id);
          timeoutId = setTimeout(() => {
            props.setPreviewPageId(props.child.id);
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
          props.setPreviewPageId(null);
          const dataTransfer = selectedComponents().size > 0
            ? Array.from(selectedComponents())
            : [graph.vertexes[props.child.id]];
          setDraggedVertex((prev) => [...prev, ...dataTransfer]);
          setSelectedComponents(new Set<Vertex>());
        }}
        ondblclick={() => {
          setDraggedVertex([graph.vertexes[props.child.id]]);
          onClickAddComponent(
            graph,
            setGraph,
            pageConfig.formData.txnId,
            draggedVertex()[0],
            pageConfig.formData || {},
            selectedId() !== -1
              ? selectedId()
              : pageConfig.formData.formData.id
          );
          setDraggedVertex([]);
        }}
      >
        <Icon icon={"iconoir:multiple-pages"} height={22} width={22} />
        <div style={{ "font-size": "14px" }}>{toTitle(props.child.name)}</div>
        <Show when={props.previewPageId === props.child.id}>
          <DropdownMenu parentRef={menuRef!} onMouseLeave={() => props.setPreviewPageId(null)} onClickOutside={() => props.setPreviewPageId(null)}>
            {toTitle(props.child.name)} Preview
            <PageViewWrapper formId={props.child.id} />
          </DropdownMenu>
        </Show>
      </div>

    </Show>
  );
}
