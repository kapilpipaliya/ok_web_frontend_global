import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/IconButton";

import { PreviewCSSMenu } from "./PreviewCSSMenu";

export function PreviewCSSButton(props: Readonly<{
  class?: string;
  item: Vertex;
  size: number;
}>) {
  let previewCSSRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
  let timer: NodeJS.Timeout;

  const handleMouseEnter = () => {
    timer = setTimeout(() => setShowModal(true), 500);
  };

  const _handleMouseLeave = () => {
    clearTimeout(timer);
    setShowModal(false);
  };

  return (
    <>
      <IconButton
        class={`${props.class} cursor:pointer`}
        icon="ic:baseline-css"
        onClick={() => setShowModal(true)}
        onMouseEnter={handleMouseEnter}
        // onMouseLeave={handleMouseLeave}
        ref={(el) => (previewCSSRef = el)}
        size={props.size}
        title="Preview CSS" />
      <Show when={showModal()}>
        <PreviewCSSMenu
          item={props.item}
          onClose={() => setShowModal(false)}
          onMouseLeave={() => setShowModal(false)}
          parentRef={previewCSSRef!} />
      </Show>
    </>
  );
}
