import { createSelector, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { AttrActionButtons } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/AttrActionButtons";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { getComponentLabel } from "../../functions/component/getComponentLabel";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function AttrConfigIcons(
  props: Readonly<{ metaVertex: Vertex; parentRef: HTMLElement }>,
) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );

  const isRootLevel = () =>
    formStoreVertex()?.P.formDataId === props.metaVertex.id;

  const iconSize = 32;

  const getComponent = () => getComponentLabel(graph, props.metaVertex);

  return (
    <DropdownMenu
      applyDefaultStyles={false}
      offset={-32}
      parentRef={props.parentRef}
      placement="right"
      useFlip={false}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: \${args.theme.var.color.background_light_100};
}\`;`}
      >
        <Show when={isSelectedLayoutId(props.metaVertex.id)}>
          <AttrActionButtons
            componentName={getComponent()}
            isRootLevel={isRootLevel()}
            isSelected={isSelectedLayoutId(props.metaVertex.id)}
            item={props.metaVertex}
            layout="column"
            size={iconSize}
          />
        </Show>
      </As>
    </DropdownMenu>
  );
}
