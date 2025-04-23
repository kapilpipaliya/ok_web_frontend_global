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
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph } from "~/lib/graph/GraphContext";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/data/fetchAndSetGraphData";
import { headerIconButtonCss, STYLES } from "~/pages/settings/constants";

import {
  DesignerFormIdContext,
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "../context/LayoutContext";
import { TabButton } from "../settings/TabButton";
import { ComponentList } from "./components/ComponentList";
import { openInNewInternalTab } from "./pages/functions/openInNewInternalTab";
import { PagesList } from "./pages/PagesList";
import { TabsContainer } from "./TabsContainer";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { Divider } from "../../../components/styled/Divider";

export const UlContainer = (props: ParentProps) => (
  <As
    as="ul"
    css={[
      STYLES.overflowCss,
      css`
  display: flex;
  gap: 5px;
  margin-bottom: -1px;
  flex-wrap: nowrap;
  list-style: none;
  padding: 0;
`,
    ]}
  >
    {props.children}
  </As>
);

type SectionHeaderProps = {
  title: string;
  onAddClick: () => void;
};

const SectionHeader = (props: SectionHeaderProps) => (
  <As
    as="div"
    css={[
      css`
  display: flex;
  align-items: center;
  gap: 2px;
`,
    ]}
  >
    <As
      as="div"
      css={[
        css`
  padding: 12px;
  font-weight: 500;
`,
      ]}
    >
      {props.title}
    </As>
    <IconButton
      css={[
        headerIconButtonCss,
        css`
  margin-left: 1px;
  background-color: transparent;
  border: none;
`,
      ]}
      icon="ph:plus-circle"
      onClick={props.onAddClick}
    />
  </As>
);

const PageLevelComponents = (props: Readonly<{ rootLevel?: boolean }>) => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [rootVertexes, setRootVertexes] = createSignal<Vertex[]>([]);
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
            setGraph,
            vertexes: [graph.vertexes[formStoreVertex().P.formDataId]],
          }) || [],
        );
      } else {
        setRootVertexes([]);
      }
    }
  });

  const handleAddComponentClick = () => {
    if (!props.rootLevel && isNegative(formStoreVertex().P.formDataId)) {
      showWarningToast("Please Save Current Page first.");
      return;
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
  };

  return (
    <div>
      <SectionHeader 
        title={props.rootLevel ? "Global Components" : "Page Components"} 
        onAddClick={handleAddComponentClick} 
      />
      <ComponentList
        edgeName="ParentComponent"
        isFetchData={false}
        rootVertexes={rootVertexes()}
      />
    </div>
  );
};

const TemplatesSection = () => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const handleAddTemplateClick = () => {
    return openInNewInternalTab(
      layoutStoreId,
      {
        id: "new",
        IN: {},
        L: ["TemplatePage"],
        OUT: {},
        P: {},
      } as Vertex,
      graph,
      setGraph,
    );
  };

  return (
    <As
      as="div"
      css={[
        css`
  margin-top: 4px;
`,
      ]}
    >
      <SectionHeader 
        title="Templates" 
        onAddClick={handleAddTemplateClick} 
      />
      <PagesList coll="TemplatePage" />
    </As>
  );
};

const TabList = (props: { 
  tabs: Array<{ collection: string; title: string }>,
  selectedTab: { collection: string; title: string },
  onSelect: (tab: { collection: string; title: string }) => void
}) => (
  <UlContainer>
    <For each={props.tabs}>
      {(data) => (
        <TabButton
          data={data.title}
          isSelected={props.selectedTab === data}
          onClick={() => props.onSelect(data)}
        />
      )}
    </For>
  </UlContainer>
);

export function FormElementTabs() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreVertex = () =>
    graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const leftMenuTabs = [
    { collection: "Comp", title: "Components" },
    { collection: "Form", title: "Forms" },
    { collection: "Page", title: "Pages" },
    // { collection: "EmailTemplate", title: "Email Template" },
  ];
  const [selectedTab, setSelectedTab] = createSignal(leftMenuTabs[0]);

  return (
    <As
      as="div"
      css={[
        css`
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
  height: 100%;
`,
      ]}
    >
      <As
        as="div"
        css={css`
  background-color: \${args.theme.var.color.base_10};
  overflow-x: auto;
`}
      >
        <TabsContainer>
          <TabList 
            tabs={leftMenuTabs}
            selectedTab={selectedTab()}
            onSelect={setSelectedTab}
          />
        </TabsContainer>
      </As>

      <As
        as="div"
        css={[
          STYLES.overflowCss,
          css`
`,
        ]}
      >
        <Switch>
          <Match when={selectedTab().collection === "Comp"}>
            <ComponentList
              edgeName="ParentComp"
              rootExpression={`g:'Comp[Root]'`}
            />
            
            <Divider />
            
            <Show keyed when={formStoreVertex()?.id}>
              <DesignerFormIdContext.Provider value={formStoreVertex().id}>
                <PageLevelComponents rootLevel={false} />
              </DesignerFormIdContext.Provider>
            </Show>

            <Divider />

            <As
              as="div"
              css={[
                css`
  margin-top: 4px;
`,
              ]}
            >
              <Show keyed when={formStoreVertex()?.id}>
                <DesignerFormIdContext.Provider value={formStoreVertex().id}>
                  <PageLevelComponents rootLevel={true} />
                </DesignerFormIdContext.Provider>
              </Show>
            </As>

            <Divider />

            <TemplatesSection />
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
      </As>
    </As>
  );
}
