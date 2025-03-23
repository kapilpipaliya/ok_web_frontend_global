import type { Vertex } from "~/lib/graph/graph";

import { useZIndex } from "~/components/fields/ZIndex";
import { IconButton } from "~/components/styled/IconButton";
import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { handleDragStart } from "~/features/page_designer/event_handler/handleDragStart";
import { getComponentLabel } from "~/features/page_designer/functions/component/getComponentLabel";
import { useGraph } from "~/lib/graph/GraphContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { DeleteButton } from "../buttons/DeleteButton";
import { DuplicateButton } from "../buttons/DuplicateButton";
import { ImportHtmlButton } from "../buttons/ImportHtmlButton";
import { ParentButton } from "../buttons/ParentButton";
import { PreviewCSSButton } from "../buttons/PreviewCSSButton";
import { SaveAsTemplateButton } from "../buttons/SaveAsTemplateButton";
import { ComponentName } from "../components/ComponentName";
import { InsertButtons } from "../menus/InsertButtons";

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
        class={`flex ai:center bg:primary-40 bottom:100% color:base-5 gap:5px p:0.25rem position:absolute r:5px|5px|0px|0px z:${zIndex}`}
      >
        <IconButton
          class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.default}`}
          draggable={true}
          icon="ph:dots-six-vertical-bold"
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
          class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.delete}`}
          componentName={getComponentName()!}
          item={props.item}
          size={iconSize}
        />
      </div>
    </span>
  );
}
