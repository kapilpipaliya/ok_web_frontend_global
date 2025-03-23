import { createSignal, type Setter } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/styled/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { useDesignerLayoutStore } from "~/features/page_designer/context/LayoutContext";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export function PreviewCSSMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave: (event: MouseEvent) => void;
    parentRef: HTMLElement;
    ref: Setter<HTMLElement | null>;
  }>,
) {
  const [_layoutStore] = useDesignerLayoutStore();
  // TODO: fix this
  const [cssContent, _setCssContent] = createSignal("ABC");

  return (
    <DropdownMenu
      class="padding:0.50rem"
      onClickOutside={props.onClose}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
      ref={props.ref}
    >
      <DialogHeader title="Preview CSS" />
      <DialogSubTitle>View the CSS content below:</DialogSubTitle>

      <div class="mt:2">
        <code>{cssContent()}</code>
      </div>

      <DialogFooter>
        <button
          class={SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS}
          onClick={props.onClose}
          type="button"
        >
          Close
        </button>
      </DialogFooter>
    </DropdownMenu>
  );
}
