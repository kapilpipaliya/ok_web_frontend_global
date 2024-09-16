import { createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { IconButton } from "~/components/IconButton";
import PageView from "~/components/page_attr_render/PageView";
import PreviewPage from "~/components/PreviewPage";
import { useZIndex, ZIndex } from "~/components/ZIndex";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { headerIconButtonClass } from "~/pages/admin_layout/constant";

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
          metaVertex={layoutStore.formStore[0].formData}
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
            <IconButton
              class="bg:transparent border:none cursor:pointer position:absolute right:10px top:10px"
              icon="ph:x"
              onClick={handleCloseClick}
              size={22}
              title="Close"
              type="button"
            />
            <Content />
          </div>
        </div>
      </Portal>
    );
  };

  return (
    <>
      <IconButton
        class={headerIconButtonClass}
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
