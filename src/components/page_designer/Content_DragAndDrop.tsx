
import { type Accessor, Show, } from "solid-js";
import { ResizableContainer } from "~/components/ResizableDivView";
import { PageView } from "~/components/page_attr_render/PageView";
import { useDesignerLayoutStore } from "./LayoutContext";

export function ContentDragAndDrop(props: Readonly<{ view: Accessor<string> }>) {
  const [pageConfig] = useDesignerLayoutStore();

  return (
      <Show when={pageConfig.formData}>
        <ResizableContainer view={props.view}>
          <PageView metaVertex={pageConfig.formData?.formData} isPreview={false} />
        </ResizableContainer>
      </Show>
  );
}
