import { Icon } from "@iconify-icon/solid";
import { props } from "rambda";
import { type Accessor, Show, useContext } from "solid-js";
import ResizableContainer from "~/components/custom/ResizableDivView";
import Drawer from "~/components/custom/drawer";
import { PageView } from "~/components/dynamic/fields/static/GenaricField";
import { Tooltip } from "~/components/solid-blocks/blocks";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import { FormContext } from "~/lib/Utils";
import { PageConfigContext } from "~/lib/contexts";

export function ContentDragAndDrop(props: {view: Accessor<string>}) {
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);

  return (
    <div class="grid jc:center grid-area:content overflow:auto">
      <Show when={pageConfig.formData}>
        <div class="flex flex-flow:column gap:5 p:10 jc:center">
          <Tooltip content={"Undo"} position={"n"}>
            <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
              <Icon icon={"ci:arrow-undo-up-left"} height={22} width={22} />
            </div>
          </Tooltip>
          <Tooltip content={"Redo"} position={"n"}>
            <div class="b:1px|solid|lightgrey color:#000:hover color:grey bg:white flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
              <Icon icon={"ci:arrow-undo-up-right"} height={22} width={22} />
            </div>
          </Tooltip>
        </div>
        <ResizableContainer view={props.view}>
          <FormContext.Provider value={pageConfig.formData}>
            <PageView vertex={pageConfig.formData?.formData} />
          </FormContext.Provider>
        </ResizableContainer>
      </Show>
    </div>
  );
}
