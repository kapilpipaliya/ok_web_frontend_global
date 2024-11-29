import { createSignal, For, Match, ParentProps, Switch } from "solid-js";

import { PageDesignerLabels } from "../functions/PageDesignerLabels";
import { TabButton } from "../settings/TabButton";
import { ComponentList } from "./components/ComponentList";
import { PagesList } from "./pages/PagesList";
import { TabsContainer, TabStickyContainer } from "./TabsContainer";

export const UlContainer = (props: ParentProps) => (
  <ul class="flex {scrollbar-width:thin} flex:wrap jc:space-around margin-bottom:-1px overflow-x:auto">
    {props.children}
  </ul>
);

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
    <UlContainer>
      <For each={leftMenuTabs}>
        {(data) => (
          <TabButton
            data={data.title}
            isSelected={selectedTab() === data}
            onClick={() => setSelectedTab(data)}
          />
        )}
      </For>
    </UlContainer>
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
