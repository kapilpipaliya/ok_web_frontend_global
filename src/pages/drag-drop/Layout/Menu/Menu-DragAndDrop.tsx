import { Icon } from "@iconify-icon/solid";
import {
  For,
  type Accessor,
  Match,
  Switch,
  useContext,
  createSignal,
  Show,
} from "solid-js";
import { PageConfigContext } from "~/lib/contexts";
import { Vertex } from "~/lib/graph/graph";
import { ComponentPart } from "./ComponentPart";
import { PagesPart } from "./PagesPart";
import { CollectionPart } from "./CollectionPart";
import { capitalizeFirstLetter } from "~/lib/Utils";

interface MenuProps {
  leftColumns: any;
  isLeftOpen: Accessor<boolean>;
  toggleIsLeftOpen: Accessor<boolean>;
}

export function MenuDragAndDrop(props: MenuProps) {
  return (
    <nav style={{ "grid-area": "menu", "width": "55%", "min-width": "318px", 'justify-self': 'left', }}>
      <div class={"rel"}>
        <div
          class={`h:100vh  flex-col overflow:auto border:1|solid|lightgrey m:5 r:5|5|5|5 direction:rtl`}
          style={{
            "max-height": "calc(100vh - 120px)",
            "scrollbar-width": "thin",
            "scrollbar-color": "lightgrey",
          }}
        >
          <Show when={props.isLeftOpen()}>
            <Column
              datas={props.leftColumns()}
              toggleLeftOpen={props.toggleIsLeftOpen}
            />
          </Show>
        </div>
      </div>
    </nav>
  );
}

const Column = (props: {
  datas: any;
  toggleLeftOpen: Accessor<boolean>;
}) => {
  const [selectedTab, setSelectedTab] = createSignal("components");

  return (
    <>
      <div class={"p:5 direction:ltr "}>
        <div class="position:sticky top:0 p:4 bg:white z:1">
          <div class="p:5|10 flex ai:center jc:space-between bg:#f4f4f4 f:0.875rem r:5">
            <div class="font-weight:600">Form Elements</div>
            <Icon
              class="cursor:pointer bg:white:hover r:50%"
              onClick={props.toggleLeftOpen}
              icon={"iconamoon:close-duotone"}
              height={30}
              width={30}
              style={{ color: "#c1c1c1" }}
            />
          </div>
          <div class="f:0.875rem mb:10 lh:1rem font-weight:500  text-align:center  color:rgb(107,114,128)  border-bottom-width:1px  border-color:rgb(229,231,235) ">
            <ul class="jc:space-around  flex flex-wrap:wrap  margin-bottom:-1px ">
              <For each={props.datas}>
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
        <Switch>
          <Match when={selectedTab() === "components"}>
            <ComponentPart />
          </Match>
          <Match when={selectedTab() === "pages"}>
            <PagesPart />
          </Match>
          <Match when={selectedTab() === "collection"}>
            <CollectionPart />
          </Match>
        </Switch>
      </div>
    </>
  );
};
