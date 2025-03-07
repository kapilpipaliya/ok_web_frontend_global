import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";

import { ImportMenu } from "./ImportMenu";
import {ICON_BUTTON_STYLES} from "~/pages/settings/constants";

interface ImportHtmlButtonProps {
  item: Vertex;
  size: number;
}

export function ImportHtmlButton(props: Readonly<ImportHtmlButtonProps>) {
  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
  return (
    <>
      <IconButton
        class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.default}`}
        icon="ph:arrow-square-down"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        ref={(el) => (saveAsTemplateRef = el)}
        size={props.size}
        title="Import HTML"
      />
      <Show when={showModal()}>
        <ImportMenu
          item={props.item}
          onClose={() => setShowModal(false)}
          // onMouseLeave={() => setShowModal(false)}
          parentRef={saveAsTemplateRef!}
        />
      </Show>
    </>
  );
}
