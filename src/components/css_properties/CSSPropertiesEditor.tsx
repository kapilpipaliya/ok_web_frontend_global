import { Icon } from "@iconify-icon/solid";
import { Show, createSignal } from "solid-js";
import { type SetStoreFunction, createStore, reconcile } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";

import { StyleEditorTab } from "~/components/css_properties/StyleEditorTab";
import { TextEditorTab } from "~/components/css_properties/TextEditorTab";
import { Container } from "~/components/css_properties/components/CssUtils";
import { type CSSStore, cssStateToString, parseAndApplyCssRules } from "~/components/css_properties/cssUtils";
import { Tab, TabContainer, TabList, Tabs } from "~/components/solid_blocks";

import { DisplaySelector } from "./components/DisplaySelector";
import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "./context";

export function CSSPropertiesEditor(props: Readonly<{
  data?: Vertex; // temp vertex
  disabled?: boolean;
  isRealTime?: boolean;
  meta: Vertex;
  setValue?: (data: any) => void;
  title?: string;
  txnId?: number;
}>) {
  const [cssState, setCssState] = createStore({} as CSSStore);
  const [cssDefaultState, setCssDefaultCssState] = createStore({} as CSSStore);
  const [state, setState] = createSignal('');

  const defaultValues = props.meta.P.value || "";
  const cssValue = props.data?.P[props.meta.P.name] as string || "";

  const initializeState = (value: string, setStateFunction: SetStoreFunction<CSSStore>) => {
    if (value) {
      if (typeof value === 'string') {
        setStateFunction(reconcile(parseAndApplyCssRules(value)));
      } else {
        setStateFunction(value);
      }
    }
  };

  initializeState(defaultValues, setCssDefaultCssState);
  initializeState(cssValue, setCssState);

  const onCSSStateChange = (...args: Parameters<SetStoreFunction<CSSStore>>) => {
    // @ts-ignore
    setCssState(...args);
    props.setValue?.(cssState);
  };

  const ResetButton = () => (
    <Show when={Object.entries(cssState).length}>
      <div class="flex jc:end p:10|0">
        <button onClick={() => setCssState(reconcile({}))} style={{ display: "flex" }}>
          <Icon icon="mdi:close" /> Reset
        </button>
      </div>
    </Show>
  );

  const TabsContainer = () => (
    <Tabs style={{ padding: "10px" }}>
      <TabList class={"m:5px"}>
        <Tab class={"w:50%"}>Design</Tab>
        <Tab class={"w:50%"}>Code</Tab>
      </TabList>
      <TabContainer>
        <Container>
          <div class="block p:20px|10px|0px|10px w:inherit">
            <DisplaySelector
              infoLink=":target"
              isAddToClass={false}
              isLabelOnTop={false}
              label="Select State"
              name="state"
              onChangeInput={(name, v) => setState(v)}
              onRemoveIconClick={() => setState('')}
              options={["active", "hover", "focus", "disabled", 'visited', 'focus-within', 'focus-visible', 'target']}
              value={state()} />
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
  );

  return (
    <CssEditorContext.Provider value={[cssState, onCSSStateChange as SetStoreFunction<CSSStore>]}>
      <CssDefaultEditorContext.Provider value={[cssDefaultState, setCssDefaultCssState]}>
        <CssStateContext.Provider value={[state, setState]}>
          <ResetButton />
          <span class={"m:10|0"}>
            <TabsContainer />
          </span>
        </CssStateContext.Provider>
      </CssDefaultEditorContext.Provider>
    </CssEditorContext.Provider>
  );
}
