import { createSignal, } from "solid-js";

import type { Vertex, } from "~/lib/graph/graph";

import { DropdownMenu } from "~/components/DropdownMenu";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";


export function PreviewCSSMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
  }>
) {
  const [_layoutStore] = useDesignerLayoutStore();
  const [cssContent, _setCssContent] = createSignal("ABC");

  return (
    <DropdownMenu
      class="padding:0.50rem"
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <h4 class="lh:1.5rem color:gray-90 f:1rem  font:bold leading:1.5rem">
        Preview CSS
      </h4>

        <div class="mt:2">
        <code>
            {cssContent()}
        </code>
        </div>
      
    </DropdownMenu>
  );
}
