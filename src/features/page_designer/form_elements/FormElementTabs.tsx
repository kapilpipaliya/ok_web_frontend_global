import { createSignal, For, Match, Switch, type ParentProps } from "solid-js";

import { STYLES } from "~/pages/settings/constants";

import { TabButton } from "../settings/TabButton";
import { ComponentList } from "./components/ComponentList";
import { ComponentPaletteTree } from "./components/ComponentPaletteTree";
import {
  COMPONENT_PALETTE_CONFIG,
  EMAIL_TEMPLATE_PALETTE_CONFIG,
  FUNCTION_PALETTE_CONFIG,
  PAGE_PALETTE_CONFIG,
} from "./components/componentPaletteConfig";
import { TabsContainer } from "./TabsContainer";
import { As } from "~/components/As";
import { Divider } from "../../../components/styled/Divider";

export const UlContainer = (props: ParentProps) => (
  <As
    as="ul"
    css={[
      STYLES.overflowCss,
      `return \`._id {
  display: flex;
  gap: 5px;
  margin-bottom: -1px;
  flex-wrap: nowrap;
  list-style: none;
  padding: 0;
}\`;`,
    ]}
  >
    {props.children}
  </As>
);

const TabList = (props: {
  tabs: Array<{ collection: string; title: string }>;
  selectedTab: { collection: string; title: string };
  onSelect: (tab: { collection: string; title: string }) => void;
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

const panelContentCss = [
  STYLES.overflowCss,
  `return \`._id {
  min-height: 0;
  min-width: 0;
  height: 100%;
}\`;`,
];

export function ComponentsPanel() {
  return (
    <As as="div" css={panelContentCss}>
      <ComponentList
        edgeName="ParentComp"
        rootExpression={`g:'Comp[Root]'`}
      />

      <Divider />

      <As as="div" css={"return `._id { margin-top: 4px; }`;"}>
        <ComponentPaletteTree searchAlways />
      </As>
    </As>
  );
}

export function PagesPanel() {
  const pageTabs = [
    { collection: "Page", title: "Pages" },
    { collection: "EmailTemplate", title: "Email Templates" },
    { collection: "Function", title: "Functions" },
  ];
  const [selectedTab, setSelectedTab] = createSignal(pageTabs[0]);

  return (
    <As
      as="div"
      css={`return \`._id {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
  height: 100%;
  min-height: 0;
}\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  background-color: \${args.theme.var.color.background_light_100};
  overflow-x: auto;
  flex-shrink: 0;
}\`;`}
      >
        <TabsContainer>
          <TabList
            tabs={pageTabs}
            selectedTab={selectedTab()}
            onSelect={setSelectedTab}
          />
        </TabsContainer>
      </As>

      <As as="div" css={panelContentCss}>
        <Switch>
          <Match when={selectedTab().collection === "Page"}>
            <ComponentPaletteTree
              config={PAGE_PALETTE_CONFIG}
              searchAlways
            />
          </Match>
          <Match when={selectedTab().collection === "EmailTemplate"}>
            <ComponentPaletteTree
              config={EMAIL_TEMPLATE_PALETTE_CONFIG}
              searchAlways
            />
          </Match>
          <Match when={selectedTab().collection === "Function"}>
            <ComponentPaletteTree
              config={FUNCTION_PALETTE_CONFIG}
              searchAlways
            />
          </Match>
        </Switch>
      </As>
    </As>
  );
}

export function FunctionsPanel() {
  return (
    <As as="div" css={panelContentCss}>
      <ComponentPaletteTree
        config={FUNCTION_PALETTE_CONFIG}
        searchAlways
      />
    </As>
  );
}
