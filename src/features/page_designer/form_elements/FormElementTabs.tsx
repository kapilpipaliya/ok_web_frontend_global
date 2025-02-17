import {
  createEffect,
  createSignal,
  For,
  Match,
  type ParentProps,
  Show,
  Switch,
} from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { STYLES } from "~/components/styled/constants/styles";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/Toast";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";
import { headerIconButtonClass } from "~/pages/constants/constant";

import {
  DesignerFormIdContext,
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "../context/LayoutContext";
import { PageDesignerLabels } from "../functions/PageDesignerLabels";
import { TabButton } from "../settings/TabButton";
import { ComponentList } from "./components/ComponentList";
import { openInNewInternalTab } from "./pages/openInNewInternalTab";
import { PagesList } from "./pages/PagesList";
import { TabsContainer } from "./TabsContainer";

export const UlContainer = (props: ParentProps) => (
  <ul
    class={`flex ${STYLES.overflow} jc:space-around margin-bottom:-1px flex-wrap:nowrap`}
  >
    {props.children}
  </ul>
);
const PageLevelComponents = (props: Readonly<{ rootLevel?: boolean }>) => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [rootVertexes, setRootVertexes] = createSignal<any[]>([]);
  const { showWarningToast } = useToast();

  createEffect(async () => {
    if (props.rootLevel) {
      // Fetch children level Components
      const result = await fetchAndSetGraphData(
        graph,
        setGraph,
        "g:'ALL_ROOT_LEVEL_COMPONENTS'<-'ParentComponent*'",
        undefined,
        { skipExisting: true },
      );
      setRootVertexes(
        Object.values(result?.graph?.vertexes ?? {}).filter(
          (vertex) => !vertex.OUT || Object.keys(vertex.OUT).length === 0,
        ) || [],
      );
    } else {
      // children level Components are already fetched when page is loaded.
      if (formStoreVertex()?.P?.formDataId) {
        setRootVertexes(
          evalExpression("<-ParentComponent", {
            graph,
            setGraph: () => {},
            vertexes: [graph.vertexes[formStoreVertex().P.formDataId]],
          }) || [],
        );
      } else {
        setRootVertexes([]);
      }
    }
  });

  return (
    <div>
      <div class="flex ai:center gap:2">
        {props.rootLevel ? null : (
          <div class="p:12 font-weight:500">Components</div>
        )}
        <IconButton
          class={`${headerIconButtonClass} ml:1px cursor:not-allowed:disabled opacity:.5:disabled`}
          icon="ph:plus-circle"
          onClick={() => {
            if (!props.rootLevel) {
              if (isNegative(formStoreVertex().P.formDataId)) {
                showWarningToast("Please Save Current Page first.");
                return;
              }
            }
            return openInNewInternalTab(
              layoutStoreId,
              {
                id: "new",
                IN: {},
                L: ["Component"],
                OUT: {},
                P: {
                  parentId: props.rootLevel
                    ? null
                    : formStoreVertex().P.formDataId,
                },
              } as Vertex,
              graph,
              setGraph,
            );
          }}
        />
      </div>
      <ComponentList
        edgeName="ParentComponent"
        isFetchData={false}
        rootVertexes={rootVertexes()}
      />
    </div>
  );
};

export function FormElementTabs() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreVertex = () =>
    graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const leftMenuTabs = [
    { collection: "Comp", title: "Components" },
    { collection: "Component", title: "Library" },
    { collection: "TemplatePage", title: "Templates" },
    { collection: "Form", title: "Forms" },
    { collection: "Page", title: "Pages" },
    // { collection: "EmailTemplate", title: "Email Template" },
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
    <div class="flex flex:column h:100%">
      <div class="bg:base-5">
        <TabsContainer>
          <TabList />
        </TabsContainer>
      </div>

      <div class={`flex:1 ${STYLES.overflow}`}>
        <Switch>
          <Match when={selectedTab().collection === "Comp"}>
            <ComponentList
              edgeName="ParentComp"
              rootExpression={`g:'Comp[Root]'`}
            />
            <Show keyed when={formStoreVertex()?.id}>
              <DesignerFormIdContext.Provider value={formStoreVertex().id}>
                <PageLevelComponents rootLevel={false} />
              </DesignerFormIdContext.Provider>
            </Show>
          </Match>
          <Match when={selectedTab().collection === "Component"}>
            <Show keyed when={formStoreVertex()?.id}>
              <DesignerFormIdContext.Provider value={formStoreVertex().id}>
                <PageLevelComponents rootLevel={true} />
              </DesignerFormIdContext.Provider>
            </Show>
          </Match>
          <Match
            keyed
            when={PageDesignerLabels.find(
              (v) => v === selectedTab().collection,
            )}
          >
            <PagesList coll={selectedTab().collection} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}
