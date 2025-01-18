import { createSignal, For, Match, ParentProps, Switch } from "solid-js";

import { PageDesignerLabels } from "../functions/PageDesignerLabels";
import { TabButton } from "../settings/TabButton";
import { ComponentList } from "./components/ComponentList";
import { PagesList } from "./pages/PagesList";
import { TabsContainer, TabStickyContainer } from "./TabsContainer";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { evalExpression } from "~/lib/expression_eval";
import { PageLayoutObject, useDesignerLayoutStore } from "../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";


export const UlContainer = (props: ParentProps) => (
  <ul class="flex {scrollbar-width:thin} flex:wrap jc:space-around margin-bottom:-1px overflow-x:auto">
    {props.children}
  </ul>
);

const PageLevelComponents = () => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  
  const parentComponents = () => {
    return formStoreVertex()?.P?.formDataId ? evalExpression("<-ParentComponent", {
      graph,
      setGraph: () => {},
      vertexes: [graph.vertexes[formStoreVertex().P.formDataId]],
    }) : [];
  };

  return (
    <div>
      <div class="p:1rem font-weight:500">Components</div>
      <ComponentList edgeName="ParentComponent" rootVertexes={parentComponents()} isFetchData={false} />
    </div>
  );
};

export function FormElementTabs() {
  const leftMenuTabs = [
    { collection: "Comp", title: "Components" },
    { collection: "Component", title: "Library" }, // TODO: Fix to only show root level components
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
          <ComponentList edgeName="ParentComp" rootExpression={`g:'Comp[Root]'`} />
          <PageLevelComponents />
        </Match>
        <Match when={selectedTab().collection === "Component"}>
          <PagesList coll="Component" />
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
