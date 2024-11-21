import { createSignal, Show } from "solid-js";
import { IconButton } from "~/components/styled/IconButton";
import type { Vertex } from "~/lib/graph/graph";
import { InsertButtonsMenu } from "./SaveAsTemplateButton";

export function InsertButtons(props: Readonly<{ item: Vertex; }>) {
  let insertBeforeButtonsRef: HTMLElement;
  let insertAfterButtonsRef: HTMLElement;
  let insertInsideButtonsRef: HTMLElement;
  const [showBeforeMenu, setShowBeforeMenu] = createSignal(false);
  const [showAfterMenu, setShowAfterMenu] = createSignal(false);
  const [showInsideMenu, setShowInsideMenu] = createSignal(false);
  return (
    <>
      <IconButton
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon="gg:insert-before-o"
        iconClass="transition:0.5s|ease-in-out"
        onClick={() => setShowBeforeMenu(true)}
        size={18}
        ref={(el) => (insertBeforeButtonsRef = el)}
        title="Add Before" />
      <Show when={showBeforeMenu()}>
        <InsertButtonsMenu
          item={props.item}
          onClose={() => setShowBeforeMenu(false)}
          onMouseLeave={() => setShowBeforeMenu(false)}
          parentRef={insertBeforeButtonsRef!} />
      </Show>

      <IconButton
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon="gg:insert-after-o"
        iconClass="transition:0.5s|ease-in-out"
        onClick={() => setShowAfterMenu(true)}
        size={18}
        title="Add After"
        ref={(el) => (insertAfterButtonsRef = el)} />
      <Show when={showAfterMenu()}>
        <InsertButtonsMenu
          item={props.item}
          onClose={() => setShowAfterMenu(false)}
          onMouseLeave={() => setShowAfterMenu(false)}
          parentRef={insertAfterButtonsRef!} />
      </Show>

      <IconButton
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon="material-symbols:add-circle-outline"
        iconClass="transition:0.5s|ease-in-out"
        onClick={() => setShowInsideMenu(true)}
        size={18}
        title="Add Inside"
        ref={(el) => (insertInsideButtonsRef = el)} />
      <Show when={showInsideMenu()}>
        <InsertButtonsMenu
          item={props.item}
          onClose={() => setShowInsideMenu(false)}
          onMouseLeave={() => setShowInsideMenu(false)}
          parentRef={insertInsideButtonsRef!} />
      </Show>
    </>
  );
}
