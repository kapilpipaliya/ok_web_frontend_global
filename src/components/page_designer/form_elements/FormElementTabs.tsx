import { createSignal, For, Match, Switch } from "solid-js";

import { PageDesignerLabels } from "../functions/PageDesignerLabels";
import { TabButton } from "../settings/TabButton";
import { ComponentList } from "./components/ComponentList";
import { PagesList } from "./pages/PagesList";
import { TabsContainer, TabStickyContainer } from "./TabsContainer";

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

  const TabList = () => (
    <ul class="flex {scrollbar-width:thin} jc:space-around margin-bottom:-1px overflow-x:auto">
      <For each={leftMenuTabs}>
        {(data) => (
          <TabButton
            data={data.title}
            isSelected={selectedTab() === data}
            onClick={() => setSelectedTab(data)}
          />
        )}
      </For>
    </ul>
  );

  return (
    <>
      <TabStickyContainer>
        <TabsContainer>
          <TabList />
        </TabsContainer>
      </TabStickyContainer>

      <Switch>
        <Match when={selectedTab().collection === "Comp"}>
          <ComponentList />
        </Match>
        <Match
          keyed
          when={PageDesignerLabels.find((v) => v === selectedTab().collection)}
        >
          <PagesList coll={selectedTab().collection} />
        </Match>
      </Switch>
    </>
  );
}
