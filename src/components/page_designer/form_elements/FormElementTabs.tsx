import { createEffect, createSignal, For, Match, ParentProps, Show, Switch } from "solid-js";

import { PageDesignerLabels } from "../functions/PageDesignerLabels";
import { TabButton } from "../settings/TabButton";
import { ComponentList } from "./components/ComponentList";
import { PagesList } from "./pages/PagesList";
import { TabsContainer, TabStickyContainer } from "./TabsContainer";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { evalExpression, evalExpressionAsync } from "~/lib/expression_eval";
import { DesignerFormIdContext, PageLayoutObject, useDesignerFormIdContext, useDesignerLayoutStore } from "../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";
import { IconButton } from "~/components/styled/IconButton";
import { openInNewInternalTab } from "./pages/openInNewInternalTab";

export const UlContainer = (props: ParentProps) => (
  <ul class="flex {scrollbar-width:thin} jc:space-around margin-bottom:-1px overflow-x:auto flex-wrap:nowrap">
    {props.children}
  </ul>
);
const PageLevelComponents = (props: Readonly<{ rootLevel?: boolean }>) => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [rootVertexes, setRootVertexes] = createSignal<any[]>([]);

  createEffect(async () => {
    if (props.rootLevel) {
      // Fetch children level Components
      const result = await fetchAndSetGraphData(graph, setGraph, "g:'ALL_ROOT_LEVEL_COMPONENTS'<-'ParentComponent*'", undefined, { skipExisting: true });
      setRootVertexes(Object.values(result?.graph?.vertexes ?? {}).filter(vertex => !vertex.OUT || (Object.keys(vertex.OUT).length === 0)) || []);
    } else {
      // children level Components are already fetched when page is loaded.
      if (formStoreVertex()?.P?.formDataId) {
        setRootVertexes(
          evalExpression("<-ParentComponent", {
            graph,
            setGraph: () => { },
            vertexes: [graph.vertexes[formStoreVertex().P.formDataId]],
          }) || []
        );
      } else {
        setRootVertexes([]);
      }
    }
  });

  return (
    <div>
      <div class="flex ai:center gap:2">
        {!props.rootLevel ? <div class="p:1rem font-weight:500">Components</div> : null}
        <IconButton icon="ph:file"
          onClick={() => openInNewInternalTab(layoutStoreId, { L: ["Component"], id: "new" } as Vertex, graph, setGraph)}
        />
      </div>
      <ComponentList edgeName="ParentComponent" rootVertexes={rootVertexes()} isFetchData={false} />
    </div>
  );
};

export function FormElementTabs() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const leftMenuTabs = [
    { collection: "Comp", title: "Components" },
    { collection: "Component", title: "Library" },
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
          <Show when={formStoreVertex()?.id} keyed>
            <DesignerFormIdContext.Provider value={formStoreVertex().id}>
              <PageLevelComponents rootLevel={false} />
            </DesignerFormIdContext.Provider>
          </Show>
        </Match>
        <Match when={selectedTab().collection === "Component"}>
          <Show when={formStoreVertex()?.id} keyed>
            <DesignerFormIdContext.Provider value={formStoreVertex().id}>
              <PageLevelComponents rootLevel={true} />
            </DesignerFormIdContext.Provider>
          </Show>
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
