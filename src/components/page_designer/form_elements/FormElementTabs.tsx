import { For, Match, Switch, createSignal } from "solid-js";

import { ComponentList } from "./components/ComponentList";
import { PagesList } from "./pages/PagesList";

export function FormElementTabs() {
  const leftMenuTabs = [
    { collection: "Comp", title: "Components" },
    { collection: "TemplatePage", title: "Templates" },
    { collection: "Form", title: "Forms" },
    { collection: "Page", title: "Pages" },
    { collection: "ThankYouPage", title: "Thank You" },
    { collection: "ErrorPages", title: "Error Pages" },
    { collection: "EmailTemplate", title: "Email Template" },
  ];
  const [selectedTab, setSelectedTab] = createSignal(leftMenuTabs[0]);

  const Tabs = () => (
    <div class={`bg:white p:4 position:sticky top:0`}>
      <div class="lh:1rem border-bottom-width:1px border-color:rgb(229,231,235) color:rgb(107,114,128) f:0.875rem font-weight:500 mb:10 text-align:center">
        <ul class="scrollbar-width:thin flex jc:space-around margin-bottom:-1px overflow-x:auto">
          <For each={leftMenuTabs}>
            {(data) => (
              <li class="me-2 cursor:pointer">
                <button
                  class="rounded-t-lg border-bottom-width:2.5px border-color:transparent display:inline-block p:10px white-space:nowrap"
                  classList={{
                    "border-color:rgb(209,213,219):hover color:rgb(75,85,99):hover":
                      selectedTab() !== data,
                    "font-weight:600 color:rgb(37,99,235) border-bottom-width:2.5px border-color:rgb(37,99,235)":
                      selectedTab() === data,
                  }}
                  onClick={() => setSelectedTab(data)}
                  type="button"
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
    <>
      <Tabs />
      <Switch>
        <Match when={selectedTab().collection === "Comp"}>
          <ComponentList />
        </Match>
        <Match
          keyed
          when={[
            "Page",
            "TemplatePage",
            "Form",
            "ThankYouPage",
            "ErrorPage",
            "EmailTemplate",
          ].find((v) => v === selectedTab().collection)}
        >
          <PagesList coll={selectedTab().collection} />
        </Match>
      </Switch>
    </>
  );
}
