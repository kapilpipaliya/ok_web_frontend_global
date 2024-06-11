import {
  Tab,
  TabContainer,
  TabList,
  Tabs,
} from "~/components/solid_blocks";
import type { Vertex } from "~/lib/graph/graph";
import { createMemo, onCleanup, onMount } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "./context";
import { Container } from "~/components/css_properties/components/CssUtils";
import { TextEditorTab } from "~/components/css_properties/TextEditorTab";
import { StyleEditorTab } from "~/components/css_properties/StyleEditorTab";
import { DisplaySelector } from "./components/DisplaySelector";
import { createSignal } from "solid-js";

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
  const [cssState, setCssState] = createStore({} as { [state: string]: { [key: string]: string } });
  const [cssDefaultState, setDefaultCssState] = createStore({} as { [state: string]: { [key: string]: string } });
  const [state, setState] = createSignal('');
  
  const parseAndApplyCssRules = (valueString: string, isDefault = false) => {
    const cssRules = {} as { [state: string]: { [key: string]: string } };

    for (const rule of valueString.split(/[\s\n]+/)) {      
      const [property, ...valueAndState] = rule.split(/:(.+)/);
      if (!property) continue;

      const [value, state = ''] = valueAndState[0].split(/:(.+)/);
      if (!cssRules[state]) {
        cssRules[state] = {};
      }
      cssRules[state][property] = value;
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
    console.log(mergedState);
    
    // TODO: process the value
    const value = Object.entries(mergedState)
      .map(([stateKey, value]) => {        
        return Object.entries(value)
          .map(([property, val]) => `${property}:${val}${stateKey ? `:${stateKey}` : ""}`)
          .join("\n");
      })
      .join("\n");

    props.setValue?.(value);
    setCssState(mergedState);
    setDefaultCssState(cssDefaultState);
    return value;
  });

  return (
    <CssEditorContext.Provider value={[cssState, setCssState]}>
      <CssDefaultEditorContext.Provider value={[cssDefaultState, setDefaultCssState]}>
        <CssStateContext.Provider value={[state, setState]}>
          <span class={"m:10|0"}>
            <Tabs style={{ padding: "10px" }}>
              <TabList class={"m:5px"}>
                <Tab class={"w:50%"}>Design</Tab>
                <Tab class={"w:50%"}>Code</Tab>
              </TabList>
              <TabContainer>
                <Container>
                  <div class="block w:inherit p:20px|10px|0px|10px">
                    <DisplaySelector value={state()} isAddToClass={false} isLabelOnTop={false} label="Select State" name="state" options={["active", "hover", "focus", "disabled", 'visited', 'focus-within', 'focus-visible', 'target']} onChangeInput={(name, v) => setState(v)} />
                    <StyleEditorTab />
                  </div>
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
        </CssStateContext.Provider>
      </CssDefaultEditorContext.Provider>
    </CssEditorContext.Provider>
  );
}
