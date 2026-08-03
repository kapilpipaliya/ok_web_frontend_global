import { Show } from "solid-js";

import { CopyButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/CopyButton";
import { DeleteButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/DeleteButton";
import { ImportHtmlButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/ImportHtmlButton";
import { PasteButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/PasteButton";
import { SaveAsComponentButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/SaveAsComponentButton";
import { ParentButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/ParentButton";
import { InsertButtons } from "~/features/page_attr_render/page_attr_dnd_wrapper/menus/InsertButtons";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

import { HideShowIcon } from "~/features/page_designer/settings/layout/HideShowIcon";

export function AttrActionButtons(props: {
  item: Vertex;
  size: number;
  layout: "column" | "row";
  isSelected: boolean;
  isRootLevel: boolean;
  componentName?: string;
}) {
  const isColumn = () => props.layout === "column";

  return (
    <As
      as="div"
      css={`return \`._id {
        display: flex;
        flex-direction: ${isColumn() ? "column" : "row"};
        align-items: center;
        ${isColumn() ? "" : "gap: 5px;"}
      }\`;`}
    >
      <Show when={props.isSelected}>
        <InsertButtons item={props.item} size={props.size} />
      </Show>

      <Show when={props.isSelected && !props.isRootLevel}>
        <ParentButton item={props.item} size={props.size} />
      </Show>

      <Show when={props.isSelected}>
        <CopyButton item={props.item} size={props.size} />
        <PasteButton item={props.item} size={props.size} />
        <SaveAsComponentButton item={props.item} size={props.size} />
        <ImportHtmlButton item={props.item} size={props.size} />
      </Show>

      <Show when={props.isSelected && !props.isRootLevel}>
        <HideShowIcon iconSize={props.size} metaVertex={props.item} />
      </Show>

      <Show
        when={props.isSelected && !props.isRootLevel && props.componentName}
      >
        <DeleteButton
          componentName={props.componentName!}
          item={props.item}
          size={props.size}
        />
      </Show>
    </As>
  );
}
