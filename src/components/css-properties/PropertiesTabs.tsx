import {
  Tab,
  TabContainer,
  TabList,
  Tabs,
} from "~/components/solid-blocks/blocks";
import type { Vertex } from "~/lib/graph/graph";
import {
  createEffect,
  on,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { CssEditorContext } from "./cssContext";
import { Container } from "./css-components/CssUtils";
import { TextEditor } from "./css-tabs/TextEditor";
import { StyleEditor } from "./css-tabs/StyleEditor";

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

  createEffect(
    on(
      () => (props.data?.P[props.meta.P.name] as string) ?? "",
      parseAndApplyCssRules,
    ),
  );

  function getCssValue() {
    return Object.entries(cssState)
      .map(([key, value]) => `${key}:${value}`)
      .join("\n");
  }

  createEffect(() => {
    props.setValue?.(getCssValue());
  });

  return (
    <CssEditorContext.Provider value={[cssState, setCssState]}>
      <tr class={"min-w:100% m:5px"}>
        <td colspan="2">
          <span class={"m:10|0"}>
            <Tabs style={{ padding: "10px" }}>
              <TabList class={"m:5px"}>
                <Tab class={"w:50%"}>Design</Tab>
                <Tab class={"w:50%"}>Code</Tab>
              </TabList>
              <TabContainer>
                <Container>
                  <StyleEditor />
                </Container>
              </TabContainer>
              <TabContainer>
                <Container>
                  <TextEditor
                    getCssValue={getCssValue}
                    parseAndApplyCssRules={parseAndApplyCssRules}
                  />
                </Container>
              </TabContainer>
            </Tabs>
          </span>
        </td>
      </tr>
    </CssEditorContext.Provider>
  );
}


