import { Show, useContext } from "solid-js";
import ResizableContainer from "~/components/custom/ResizableDivView";
import Drawer from "~/components/custom/drawer";
import { PageView } from "~/components/dynamic/fields/static/GenaricField";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import { FormContext } from "~/lib/Utils";
import { PageConfigContext } from "~/lib/contexts";

export function ContentDragAndDrop() {
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);

  return (
    <Show when={pageConfig.formData}>
      <div class="flex ai:center jc:center">
        <ResizableContainer>
          <FormContext.Provider value={pageConfig.formData}>
            <PageView vertex={pageConfig.formData?.formData} />
          </FormContext.Provider>
          <Drawer
            customButton={(props) => (
              <CustomButton {...props}>Open Drawer</CustomButton>
            )}
            title="First Drawer"
            width="450px"
          >
            <p>This is the first drawer's content.</p>
          </Drawer>
        </ResizableContainer>
      </div>
    </Show>
  );
}
