import { Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

import { IconButton } from "~/components/IconButton";
import PreviewPage from "~/components/PreviewPage";
import { ZIndex, useZIndex } from "~/components/ZIndex";
import PageView from "~/components/page_attr_render/PageView";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function PreviewButton() {
  const [layoutStore] = useDesignerLayoutStore();
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseClick = () => {
    setIsModalOpen(false);
  };
  const Content = () => {
    return (
      <PreviewPage>
        <PageView
          // data={dataVertex()}
          isPreview={true}
          metaVertex={layoutStore.formData.formData}
        />
      </PreviewPage>
    );
  };

  const Modal = () => {
    const zIndex = useZIndex();
    return (
      <Portal>
        <div
          class={`flex ai:center bg:rgba(0,0,0,0.5) h:full jc:center left:0 position:fixed top:0 w:full z-index:${zIndex}`}
        >
          <div class="bg:white h:full p:4 position:relative w:full">
            <button
              class="bg:transparent border:none cursor:pointer position:absolute right:10px top:10px"
              onClick={handleCloseClick}
            >
              <Icon height={22} icon={"ph:x"} width={22} />
            </button>
            <Content />
          </div>
        </div>
      </Portal>
    );
  };

  return (
    <>

        <IconButton
          class="flex ai:center b:1px|solid|lightgrey bg:white color:grey color:#000:hover cursor:pointer jc:center p:6 r:7"
          icon="ph:eye"
          onClick={handleButtonClick}
          size={22}
          title="Preview"
          type="button"
        />

      <Show when={isModalOpen()}>
        <ZIndex>
          <Modal />
        </ZIndex>
      </Show>
    </>
  );
}
