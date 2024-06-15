import { Icon } from "@iconify-icon/solid";
import { type Accessor, Show, useContext } from "solid-js";
import {ResizableContainer} from "~/components/ResizableDivView";
import { Tooltip } from "~/components/solid_blocks";
import { FormContext, PageConfigContext } from "~/lib/contexts";
import { PageView } from "~/components/page_attr_render/PageView";

export function ContentDragAndDrop(props: { view: Accessor<string> }) {
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);

  return (
    <div class="grid jc:center overflow:auto">
      <Show when={pageConfig.formData}>
        <ResizableContainer view={props.view}>
          <FormContext.Provider value={pageConfig.formData}>
            <PageView metaVertex={pageConfig.formData?.formData} />
          </FormContext.Provider>
        </ResizableContainer>
      </Show>
    </div>
  );
}
