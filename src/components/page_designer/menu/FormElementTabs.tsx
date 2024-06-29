import {
  For,
  Match,
  Switch,
  createSignal,
} from "solid-js";
import { ComponentPart } from "./ComponentPart";
import { PagesPart } from "./PagesPart";
import { useDesignerLayoutStore } from "../LayoutContext";

export function FormElementTabs() {
  const [layoutStore] = useDesignerLayoutStore();
  const [selectedTab, setSelectedTab] = createSignal(layoutStore.leftMenuTabs[0]);

  const Tabs = () => (
    <div class="position:sticky top:0 p:4 bg:white z:1">
      <div class="f:0.875rem mb:10 lh:1rem font-weight:500 text-align:center color:rgb(107,114,128) border-bottom-width:1px border-color:rgb(229,231,235)">
        <ul class="jc:space-around flex flex-wrap:wrap margin-bottom:-1px">
          <For each={layoutStore.leftMenuTabs}>
            {(data) => (
              <li class="me-2 cursor:pointer">
                <button
                  type="button"
                  onClick={() => setSelectedTab(data)}
                  class={`${selectedTab() === data
                    ? "font-weight:600 color:rgb(37,99,235) border-bottom-width:2.5px border-color:rgb(37,99,235)"
                    : "border-color:rgb(209,213,219):hover color:rgb(75,85,99):hover"} display:inline-block p:10px border-bottom-width:2.5px border-color:transparent rounded-t-lg`}
                >
                  {data.title}
                </button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );

  return (
    <div class={"p:5 direction:ltr "}>
        <Tabs/>
        <Switch>
          <Match when={selectedTab().collection === "Comp"}>
            <ComponentPart />
          </Match>
          <Match when={[
            "Page",
            "TemplatePage",
            "Form",
            "ThankYouPage",
            "ErrorPage",
            "EmailTemplate"
          ].find((v)=> v ===selectedTab().collection)} keyed>
            <PagesPart coll={selectedTab().collection} />
          </Match>
        </Switch>
      </div>
  );
}

