import { type JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "~/components/solid_blocks";

export function RenderModal(props: { children: JSX.Element; isOpen: boolean; toggle: () => void; }) {
  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class="sb-modal r:10|10|10|10" role="dialog">
          <ModalContent>
            <ModalHeader>
              Header
              <button onclick={props.toggle} style={{ float: "right" }}>
                ✕
              </button>
            </ModalHeader>
            <ModalBody>
              {props.children}
            </ModalBody>
            <ModalFooter>
              <div
                style={{
                  "align-items": "center",
                  display: "flex",
                  "justify-content": "center",
                }}
              >
                <button onClick={props.toggle}>Submit</button>
                <button class="border-color:#FF0000 color:#FF0000" onClick={props.toggle}>Cancel</button>
              </div>
            </ModalFooter>
          </ModalContent>
        </div>
      </Portal>
    </Show>
  );
}
