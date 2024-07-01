import { type JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { ModalContent, ModalFooter, ModalHeader, ModalBody } from "~/components/solid_blocks";

export function RenderModal(props: { isOpen: boolean; toggle: () => void; children: JSX.Element; }) {
  return (
    <Show when={props.isOpen}>
      <Portal>
        <div role="dialog" tabIndex={-1} class="sb-modal r:10|10|10|10">
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
                  display: "flex",
                  "justify-content": "center",
                  "align-items": "center",
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
