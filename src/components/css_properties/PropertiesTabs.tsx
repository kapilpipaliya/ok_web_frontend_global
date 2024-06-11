import {
  Tab,
  TabContainer,
  TabList,
  Tabs,
} from "~/components/solid_blocks";
import type { Vertex } from "~/lib/graph/graph";
import { createMemo } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { CssEditorContext } from "./context";
import { Container } from "~/components/css_properties/components/CssUtils";
import { TextEditorTab } from "~/components/css_properties/TextEditorTab";
import { StyleEditorTab } from "~/components/css_properties/StyleEditorTab";

export function ClassDesignTab(props: {
  component: string;
  meta: Vertex;
  title?: string;
  data?: Vertex; // temp vertex
  setValue?: (data: any) => void;
  disabled?: boolean;
  isRealTime?: boolean;
  txnId?: number;
}) {
  const [cssState, setCssState] = createStore({} as { [key: string]: any });

  // note: 'props.data?.P[props.meta.P.name]' only change by Page Designer component when click on Layout item.
  const parseAndApplyCssRules = (valueString: string) => {
    const cssRules = {} as { [key: string]: string };

    for (const [key, value] of valueString
      .split(/[\s\n]+/)
      .map((rule) => rule.split(":"))) {
      if (key === "") continue;
      cssRules[key] = value;
    }
    setCssState(reconcile(cssRules));
  };

  function getCssValue() {
    return Object.entries(cssState)
      .map(([key, value]) => `${key}:${value}`)
      .join("\n");
  }

  const defaultValues = createMemo(() => props.meta.P.value || "");

  // Create a memo to reactively track the CSS value string
  const cssValue = createMemo(() => (props.data?.P[props.meta.P.name] as string) ?? "");

  // Use the memo to parse and apply CSS rules
  parseAndApplyCssRules(cssValue());

  // Update the setValue prop when cssState changes
  const memoizedCssValue = createMemo(() => {
    const value = getCssValue();
    props.setValue?.(value);
    return value;
  });

  return (
    <CssEditorContext.Provider value={[cssState, setCssState]}>
          <span class={"m:10|0"}>
            <Tabs style={{ padding: "10px" }}>
              <TabList class={"m:5px"}>
                <Tab class={"w:50%"}>Design</Tab>
                <Tab class={"w:50%"}>Code</Tab>
              </TabList>
              <TabContainer>
                <Container>
                  <StyleEditorTab />
                </Container>
              </TabContainer>
              <TabContainer>
                <Container>
                  <TextEditorTab
                    getCssValue={getCssValue}
                    parseAndApplyCssRules={parseAndApplyCssRules}
                  />
                </Container>
              </TabContainer>
            </Tabs>
          </span>
    </CssEditorContext.Provider>
  );
}
