import { createSelector, Show } from "solid-js";

import { ImportHtmlButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/ImportHtmlButton";
import { InsertButtons } from "~/components/page_attr_render/page_attr_dnd_wrapper/InsertButtons";
import { SaveAsTemplateButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/SaveAsTemplateButton";
import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { DuplicateButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/DuplicateButton";
import { DeleteButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/DeleteButton";
import { ParentButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/ParentButton";
import { HideShowIcon, toggleHidden } from "./HideShowIcon";

export function AttrConfigIcons(props: Readonly<{ metaVertex: Vertex, parentRef: HTMLElement }>) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isSelectedLayoutId = createSelector(() => formStoreVertex()?.P.selectedId);
  // const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);

  const iconSize = 32;

  const getComponent = () =>
    getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P.key as string;

  return (
    <DropdownMenu
      applyDefaultStyles={false}
      placement="right"
      parentRef={props.parentRef}
      useFlip={false}
      offset={-32}
    >
      <div class="flex flex:col ai:center bg:white">
        <Show
          when={
            isSelectedLayoutId(props.metaVertex.id)
          }
        >
          <InsertButtons item={props.metaVertex} size={iconSize} />
        </Show>

        <Show
          when={
            isSelectedLayoutId(props.metaVertex.id)
          }
        >
          <ParentButton item={props.metaVertex} size={iconSize} />
          <DuplicateButton item={props.metaVertex} size={iconSize} />
          <SaveAsTemplateButton
            item={props.metaVertex}
            size={iconSize}
          />
          <ImportHtmlButton item={props.metaVertex} size={iconSize} />
          <HideShowIcon metaVertex={props.metaVertex} iconSize={iconSize} onClick={() => {
            toggleHidden(props.metaVertex.id, formStoreId!, graph, setGraph);
          }} />
          <DeleteButton componentName={getComponent()} item={props.metaVertex} size={iconSize} class="color:red" />
          &nbsp;
        </Show>
      </div>
    </DropdownMenu>
  );
}
