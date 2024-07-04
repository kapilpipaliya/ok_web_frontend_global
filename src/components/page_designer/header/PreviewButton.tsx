import { Icon } from "@iconify-icon/solid";
import { Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";

import { useDesignerLayoutStore } from "../LayoutContext";

export function PreviewButton() {
  const [layoutStore] = useDesignerLayoutStore();
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseClick = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Tooltip content={"Preview"} position={"s"}>
        <button
          class="flex ai:center b:1px|solid|lightgrey bg:white color:grey color:#000:hover cursor:pointer h:35px jc:center r:7 w:37px"
          onClick={handleButtonClick}
          type="button"
        >
          <Icon height={22} icon={"ph:eye"} width={22} />
        </button>
      </Tooltip>
      <Show when={isModalOpen()}>
        <Portal>
          <div class="flex ai:center bg:rgba(0,0,0,0.5) h:full jc:center left:0 position:fixed top:0 w:full">
            <div class="bg:white h:full p:4 position:relative w:full">
              <button
                class="bg:transparent border:none cursor:pointer position:absolute right:10px top:10px"
                onClick={handleCloseClick}
              >
                <Icon height={22} icon={"ph:x"} width={22} />
              </button>
              Content
            </div>
          </div>
        </Portal>
      </Show>
    </>
  );
}
