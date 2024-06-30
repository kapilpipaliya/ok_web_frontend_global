import { Tab, TabContainer, TabList, Tabs, } from "~/components/solid_blocks";
import { Icon } from "@iconify-icon/solid";
import type { Vertex } from "~/lib/graph/graph";
import { Show, createSignal } from "solid-js";
import { type SetStoreFunction, createStore, reconcile } from "solid-js/store";
import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "./context";
import { Container } from "~/components/css_properties/components/CssUtils";
import { TextEditorTab } from "~/components/css_properties/TextEditorTab";
import { StyleEditorTab } from "~/components/css_properties/StyleEditorTab";
import { DisplaySelector } from "./components/DisplaySelector";
import { cssStateToString, type CSSStore, parseAndApplyCssRules } from "~/components/css_properties/cssUtils";

export function CSSPropertiesEditor(props: Readonly<{
  component: string;
  meta: Vertex;
  title?: string;
  data?: Vertex; // temp vertex
  setValue?: (data: any) => void;
  disabled?: boolean;
  isRealTime?: boolean;
  txnId?: number;
}>) {
  const [cssState, setCssState] = createStore({} as CSSStore);
  const [cssDefaultState, setCssDefaultCssState] = createStore({} as CSSStore);
  const [state, setState] = createSignal('');

  const defaultValues = props.meta.P.value || "";
  const cssValue = props.data?.P[props.meta.P.name] as string || "";

  if (defaultValues) {
    if (typeof defaultValues === 'string') {
      setCssDefaultCssState(reconcile(parseAndApplyCssRules(defaultValues)));
    } else {
      setCssDefaultCssState(defaultValues);
    }
  }
  if (cssValue) {
    if (typeof cssValue === 'string') {
      setCssState(reconcile(parseAndApplyCssRules(cssValue)));
    } else {
      setCssState(cssValue);
    }
  }
  const onCSSStateChange = (...args: Parameters<SetStoreFunction<CSSStore>>) => {
    // @ts-ignore
    setCssState(...args);
    props.setValue?.(cssState);
  }

  return (
    <CssEditorContext.Provider value={[cssState, onCSSStateChange as SetStoreFunction<CSSStore>]}>
      <CssDefaultEditorContext.Provider value={[cssDefaultState, setCssDefaultCssState]}>
        <CssStateContext.Provider value={[state, setState]}>
          <Show when={Object.entries(cssState).length}>
            <div class="flex jc:end p:10|0">
              <button
                onClick={() => setCssState(reconcile({}))}
                style={{ display: "flex" }}
              ><Icon icon="mdi:close" /> Reset</button>
            </div>
          </Show>
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
                      onRemoveIconClick={() => setState('')}
                      isAddToClass={false}
                      isLabelOnTop={false}
                      label="Select State"
                      name="state"
                      infoLink=":target"
                      options={["active", "hover", "focus", "disabled", 'visited', 'focus-within', 'focus-visible', 'target']}
                      onChangeInput={(name, v) => setState(v)} />
                    <StyleEditorTab />
                  </div>
                </Container>
              </TabContainer>
              <TabContainer>
                <Container>
                  <div class="content mt:5">
                    Default Value(Read only)
                    <TextEditorTab
                      getCssValue={cssStateToString(cssDefaultState)}
                      parseAndApplyCssRules={parseAndApplyCssRules}
                    />
                    Property value
                    <TextEditorTab
                      getCssValue={cssStateToString(cssState)}
                      parseAndApplyCssRules={parseAndApplyCssRules}
                    />
                  </div>
                </Container>
              </TabContainer>
            </Tabs>
          </span>
        </CssStateContext.Provider>
      </CssDefaultEditorContext.Provider>
    </CssEditorContext.Provider>
  );
}
