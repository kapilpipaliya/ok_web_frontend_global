import {Tab, TabContainer, TabList, Tabs,} from "~/components/solid_blocks";
import {Icon} from "@iconify-icon/solid";
import type {Vertex} from "~/lib/graph/graph";
import {createMemo, createSignal, onMount} from "solid-js";
import {createStore, reconcile} from "solid-js/store";
import {CssDefaultEditorContext, CssEditorContext, CssStateContext} from "./context";
import {Container} from "~/components/css_properties/components/CssUtils";
import {TextEditorTab} from "~/components/css_properties/TextEditorTab";
import {StyleEditorTab} from "~/components/css_properties/StyleEditorTab";
import {DisplaySelector} from "./components/DisplaySelector";
import {cssStateToString, CSSStore, parseAndApplyCssRules} from "~/components/css_properties/cssUtils";

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
  const [cssState, setCssState] = createStore({} as CSSStore);
  const [cssDefaultState, setDefaultCssState] = createStore({} as CSSStore);
  const [state, setState] = createSignal('');

  const defaultValues = createMemo(() => props.meta.P.value || "");
  const cssValue = createMemo(() => (props.data?.P[props.meta.P.name] as string) ?? "");

  onMount(() => {
    setCssState(reconcile(parseAndApplyCssRules(cssValue())));
    setDefaultCssState(reconcile(parseAndApplyCssRules(defaultValues())));
  });

  // Merge null key into the default state and update setValue prop
  const memoizedCssValue = createMemo(() => {
    const value = cssStateToString(cssState);

    props.setValue?.(value);
    // setCssState(mergedState);
    // setDefaultCssState(cssDefaultState);
    return value;
  });

  return (
    <CssEditorContext.Provider value={[cssState, setCssState]}>
      <CssDefaultEditorContext.Provider value={[cssDefaultState, setDefaultCssState]}>
        <CssStateContext.Provider value={[state, setState]}>
          <Icon
            onClick={() => setCssState(reconcile({}))}
            icon={"mdi:close"}
            style={{ color: "grey" }}
          />
          <span class={"m:10|0"}>
            <Tabs style={{ padding: "10px" }}>
              <TabList class={"m:5px"}>
                <Tab class={"w:50%"}>Design</Tab>
                <Tab class={"w:50%"}>Code</Tab>
              </TabList>
              <TabContainer>
                <Container>
                  <div class="block w:inherit p:20px|10px|0px|10px">
                    <DisplaySelector
                      value={state()}
                      isAddToClass={false}
                      isLabelOnTop={false}
                      label="Select State"
                      name="state"
                      options={["active", "hover", "focus", "disabled", 'visited', 'focus-within', 'focus-visible', 'target']}
                      onChangeInput={(name, v) => setState(v)} />
                    <StyleEditorTab />
                  </div>
                </Container>
              </TabContainer>
              <TabContainer>
                <Container>
                  Default Value(Read only)
                  <TextEditorTab
                    getCssValue={defaultValues()}
                    parseAndApplyCssRules={parseAndApplyCssRules}
                  />
                  Property value
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
