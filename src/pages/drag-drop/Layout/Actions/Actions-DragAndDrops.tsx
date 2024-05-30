import { Icon } from "@iconify-icon/solid";
import {
  useContext,
  For,
  Accessor,
  Match,
  Switch,
  createSignal,
} from "solid-js";
import { PageConfigContext, SelectedIdContext } from "~/lib/contexts";
import { Vertex } from "~/lib/graph/graph";
import { LayoutPart } from "./LayoutPart";
import { FormConfig } from "./FormConfig";
import { Properties } from "./Properties";
import { capitalizeFirstLetter } from "~/lib/Utils";
import { FormSetting } from "./FormSetting";
interface ActionsProps {
  leftColumns: any;
  rightColumns: any;
  isRightOpen: Accessor<boolean>;
  toggleIsRightOpen: Accessor<boolean>;
}
export function ActionsDragAndDrops(props: ActionsProps) {
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);

  return (
    <aside
      style={{ "grid-area": "callToAction", "width": "75%","min-width": "400px",'justify-self':'right', }}
      classList={{ "display:none": !props.isRightOpen() }}
    >
      <div
        class={`h:100vh flex-col overflow-x:auto border:1|solid|lightgrey m:5 r:5|5|5|5`}
        style={{
          "max-height": "calc(100vh - 120px)",
          "scrollbar-width": "thin",
          "scrollbar-color": "lightgrey",
        }}
      >
        <Column
          toggleIsRightOpen={props.toggleIsRightOpen}
          datas={props.rightColumns}
        />
      </div>
    </aside>
  );
}

const Column = (props: { datas: any; toggleIsRightOpen: any }) => {
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);
  const [selectedTab, setSelectedTab] = createSignal("layout");

  return (
    <>
      <div class={"p:5 direction:ltr"}>
        <div class="position:sticky top:0 bg:white">
          <div class="p:5|10 flex ai:center jc:space-between bg:#f4f4f4 f:0.875rem r:5">
            <div class="font-weight:600">Form Layout</div>
            <Icon
              class="cursor:pointer bg:white:hover r:50%"
              onClick={props.toggleIsRightOpen}
              icon={"iconamoon:close-duotone"}
              height={30}
              width={30}
              style={{ color: "#c1c1c1" }}
            />
          </div>
          <div class="f:0.875rem mb:10 lh:1rem font-weight:500  text-align:center  color:rgb(107,114,128)  border-bottom-width:1px  border-color:rgb(229,231,235) ">
            <ul class="jc:space-around  flex flex-wrap:wrap  margin-bottom:-1px ">
              <For each={props.datas()}>
                {(data) => (
                  <li class="me-2 cursor:pointer">
                    <a
                      onclick={() => setSelectedTab(data.id)}
                      class={`${selectedTab() === data.id ? "font-weight:600 color:rgb(37,99,235) border-bottom-width:2.5px border-color:rgb(37,99,235)" : "border-color:rgb(209,213,219):hover color:rgb(75,85,99):hover"} display:inline-block  p:10px border-bottom-width:2.5px  border-color:transparent  rounded-t-lg`}
                    >
                      {capitalizeFirstLetter(data.name)}
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>

        <div classList={{ "display:none": selectedTab() !== "layout" }}>
          <LayoutPart />
        </div>
        <div
          classList={{ "display:none": selectedTab() !== "form" }}
          class="p:5"
        >
          <FormConfig />
        </div>
        <div
          classList={{ "display:none": selectedTab() !== "formSetting" }}
          class="p:5"
        >
          <FormSetting />
        </div>
      </div>
    </>
  );
};
