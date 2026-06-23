import { createSignal, For, Match, Switch, type ParentProps } from "solid-js";

import { STYLES } from "~/pages/settings/constants";

import { TabButton } from "../settings/TabButton";
import { ComponentList } from "./components/ComponentList";
import { ComponentPaletteTree } from "./components/ComponentPaletteTree";
import {
  COMPONENT_PALETTE_CONFIG,
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

export function FormElementTabs() {
  const leftMenuTabs = [
    { collection: "Comp", title: "Components" },
    { collection: "Page", title: "Pages" },
    { collection: "Function", title: "Functions" },
  ];
  const [selectedTab, setSelectedTab] = createSignal(leftMenuTabs[0]);

  return (
    <As
      as="div"
      css={[
        `return \`._id {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
  height: 100%;
}\`;`,
      ]}
    >
      <As
        as="div"
        css={`return \`._id {
  background-color: \${args.theme.var.color.background_light_100};
  overflow-x: auto;
}\`;`}
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
        css={`return \`._id {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}\`;`}
      >
        <Switch>
          <Match when={selectedTab().collection === "Comp"}>
            <As
              as="div"
              css={`return \`._id {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}\`;`}
            >
              <ComponentList
                edgeName="ParentComp"
                rootExpression={`g:'Comp[Root]'`}
                hideActionButtons={true}
              />

              <Divider />

              <As
                as="div"
                css={`return \`._id {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}\`;`}
              >
                <ComponentPaletteTree searchAlways title="Categories" />
              </As>
            </As>
          </Match>
          <Match when={selectedTab().collection === "Function"}>
            <As
              as="div"
              css={`return \`._id {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}\`;`}
            >
              <ComponentPaletteTree
                config={FUNCTION_PALETTE_CONFIG}
                searchAlways
                title="Functions"
              />
            </As>
          </Match>
          <Match when={selectedTab().collection === "Page"}>
            <As
              as="div"
              css={`return \`._id {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}\`;`}
            >
              <ComponentPaletteTree
                config={PAGE_PALETTE_CONFIG}
                searchAlways
                title="Pages"
              />
            </As>
          </Match>
        </Switch>
      </As>
    </As>
  );
}
