import { createSignal, Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { SaveAsComponentMenu } from "../menus/SaveAsComponentMenu";
import { As } from "~/components/As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";

interface SaveAsComponentButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function SaveAsComponentButton(
  props: Readonly<SaveAsComponentButtonProps>,
) {
  let buttonRef: HTMLElement;
  const [showMenu, setShowMenu] = createSignal(false);

  return (
    <>
      <IconButton
        css={[
          ICON_BUTTON_STYLES.baseCss,
          ICON_BUTTON_STYLES.defaultCss,
          ...ensureArray(props.css),
          `return \`._id {
            background-color: transparent;
            border: none;
          }\`;`,
        ]}
        icon="ph:floppy-disk"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(true);
        }}
        ref={(el) => (buttonRef = el)}
        size={props.size}
        title="Save as Component"
      />
      <Show when={showMenu()}>
        <SaveAsComponentMenu
          item={props.item}
          onClickOutside={() => setShowMenu(false)}
          onClose={() => setShowMenu(false)}
          parentRef={buttonRef!}
        />
      </Show>
    </>
  );
}
