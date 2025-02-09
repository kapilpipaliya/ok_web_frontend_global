import { useZIndex } from "~/components/fields/ZIndex";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { getComponentLabel } from "~/components/page_designer/functions/getComponentLabel";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../page_designer/context/LayoutContext";
import { ComponentName } from "./ComponentName";
import { DeleteButton } from "./DeleteButton";
import { DuplicateButton } from "./DuplicateButton";
import { ImportHtmlButton } from "./ImportHtmlButton";
import { InsertButtons } from "./InsertButtons";
import { ParentButton } from "./ParentButton";
import { PreviewCSSButton } from "./PreviewCSSButton";
import { SaveAsTemplateButton } from "./SaveAsTemplateButton";

interface SelectedAttrConfigPopOverProps {
  item: Vertex;
}

export function SelectedAttrConfigPopOver(
  props: Readonly<SelectedAttrConfigPopOverProps>,
) {
  const zIndex = useZIndex();

  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const [graph, setGraph] = useGraph();
  const getComponentName = () => getComponentLabel(graph, props.item);

  const iconSize = 20;
  return (
    <span class="position:relative">
      <div
        class={`flex ai:center bg:rgb(37,99,235) bottom:100% color:white gap:5px p:0.25rem position:absolute r:5px|5px|0px|0px z:${zIndex}`}
      >
        <IconButton
          class="cursor:grab"
          draggable={true}
          icon="ph:dots-six-vertical-light"
          onClick={() => {}}
          onDragStart={(e) =>
            handleDragStart(e, graph, setGraph, layoutStoreVertex(), props.item)
          }
          size={iconSize}
          title="Move"
        />
        <InsertButtons item={props.item} size={iconSize} />
        <ComponentName componentName={getComponentName()!} />
        <ParentButton item={props.item} size={iconSize} />
        <DuplicateButton item={props.item} size={iconSize} />
        <SaveAsTemplateButton item={props.item} size={iconSize} />
        <PreviewCSSButton item={props.item} size={iconSize} />
        <ImportHtmlButton item={props.item} size={iconSize} />
        <DeleteButton
          class="color:red"
          componentName={getComponentName()!}
          item={props.item}
          size={iconSize}
        />
      </div>
    </span>
  );
}
