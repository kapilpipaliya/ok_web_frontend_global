import {
  Tab,
  TabContainer,
  TabList,
  Tabs,
} from "~/components/solid_blocks";
import type { Vertex } from "~/lib/graph/graph";
import { createMemo, onCleanup, onMount } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { CssDefaultEditorContext, CssEditorContext } from "./context";
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
  const [cssDefaultState, setDefaultCssState] = createStore({} as { [key: string]: any });

  const parseAndApplyCssRules = (valueString: string, isDefault = false) => {
    const cssRules = {} as { [key: string]: string };

    for (const [key, value] of valueString
      .split(/[\s\n]+/)
      .map((rule) => rule.split(":"))) {
      if (key === "") continue;
      cssRules[key] = value;
    }
    if (isDefault) {
      setDefaultCssState(reconcile(cssRules));
    } else {
      setCssState(reconcile(cssRules));
    }
  };

  const defaultValues = createMemo(() => props.meta.P.value || "");

  const cssValue = createMemo(() => (props.data?.P[props.meta.P.name] as string) ?? "");

  onMount(() => {
    parseAndApplyCssRules(cssValue());
    parseAndApplyCssRules(defaultValues(), true);
  });

  // Merge null key into the default state and update setValue prop
  const memoizedCssValue = createMemo(() => {
    const mergedState = {
      ...cssDefaultState,
      ...cssState,
    };

    const value = Object.entries(mergedState)
      .map(([key, value]) => `${key}:${value}`)
      .join("\n");
    props.setValue?.(value);
    setCssState(mergedState);
    setDefaultCssState(cssDefaultState);
    return value;
  });

  return (
    <CssEditorContext.Provider value={[cssState, setCssState]}>
      <CssDefaultEditorContext.Provider value={[cssDefaultState, setDefaultCssState]}>
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
                  getCssValue={memoizedCssValue()}
                  parseAndApplyCssRules={parseAndApplyCssRules}
                />
              </Container>
            </TabContainer>
          </Tabs>
        </span>
      </CssDefaultEditorContext.Provider>
    </CssEditorContext.Provider>
  );
}
