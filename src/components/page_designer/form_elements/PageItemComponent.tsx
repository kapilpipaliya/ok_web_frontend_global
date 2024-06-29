import { toTitle } from "case-switcher-js";
import {
  createSignal,
  useContext, Show, onCleanup
} from "solid-js";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";
import type { NavItem } from "~/lib/graph/get/sync/traverse";
import { Icon } from "@iconify-icon/solid";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { onClickAddComponent } from "~/lib/drag_drop/onClickAddComponent";
import { DropdownMenu } from "~/components/DropdownMenu";
import { useDesignerLayoutStore } from "../LayoutContext";

export function PageItemComponent(props: Readonly<{ child: NavItem; previewPageId: Id | null, setPreviewPageId: (id: Id | null) => void }>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore() || [];
  const [hoverPageId, setHoverPageId] = createSignal<Id | null>(null);
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>()
  );

  let menuRef: HTMLButtonElement;

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

  const handleMouseEnter = () => {
    if (props.previewPageId !== props.child.id) {
      props.setPreviewPageId(null);
    }
    setHoverPageId(props.child.id);
    timeoutId = setTimeout(() => {
      props.setPreviewPageId(props.child.id);
    }, 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
    setHoverPageId(null);
  };

  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation();
    setLayoutStore('draggedVertices', []);
    clearTimeout(timeoutId);
    props.setPreviewPageId(null);
    const dataTransfer = selectedComponents().size > 0
      ? Array.from(selectedComponents())
      : [graph.vertexes[props.child.id]];
    setLayoutStore('draggedVertices', (prev) => [...prev, ...dataTransfer]);
    setSelectedComponents(new Set<Vertex>());
  };

  const handleDoubleClick = () => {
    setLayoutStore('draggedVertices', [graph.vertexes[props.child.id]]);
    onClickAddComponent(
      graph,
      setGraph,
      layoutStore.formData.txnId,
      layoutStore.draggedVertices[0],
      layoutStore.formData || {},
      layoutStore.selectedId !== -1
        ? layoutStore.selectedId
        : layoutStore.formData.formData.id
    );
    setLayoutStore('draggedVertices', []);
  };

  onCleanup(() => {
    clearTimeout(timeoutId);
  });

  return (
    <Show when={props.child.name}>
      <button
        type="button"
        ref={menuRef!}
        class="relative"
        style={itemStyle()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        draggable={true}
        onDragStart={handleDragStart}
        ondblclick={handleDoubleClick}
      >
        <Icon icon={"iconoir:multiple-pages"} height={22} width={22} />
        <div style={{ "font-size": "14px" }}>{toTitle(props.child.name)}</div>
        <Show when={props.previewPageId === props.child.id}>
          <DropdownMenu parentRef={menuRef!} onMouseLeave={() => props.setPreviewPageId(null)} onClickOutside={() => props.setPreviewPageId(null)}>
            {toTitle(props.child.name)} Preview
            <PageViewWrapper formId={props.child.id} />
          </DropdownMenu>
        </Show>
      </button>
    </Show>
  );
}

