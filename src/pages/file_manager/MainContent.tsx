import { Show } from "solid-js";

import { useFileManagerStore } from "./FileManagerContext";

export function MainContent() {
  const [state] = useFileManagerStore();
  
  return (
    <div class="bg:gray-10 w:3/4">
      <h2>Root Files</h2>
      <ul>
        <Show when={state.root}>
          <li>{state.root!.P.name}</li>
        </Show>
      </ul>
    </div>
  );
}
