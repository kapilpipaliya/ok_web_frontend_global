import { Icon } from "@iconify-icon/solid";
import { Show, createSignal, useContext } from "solid-js";
import { reconcile } from "solid-js/store";

import { StyleEditor } from "~/components/css_properties/StyleEditor";
import { TextEditor } from "~/components/css_properties/TextEditor";
import { Container } from "~/components/css_properties/components/CssUtils";
import { Tab, TabContainer, TabList, Tabs } from "~/components/solid_blocks";

import type { CSSStore } from "./context";

import { DropdownMenu } from "../DropdownMenu";
import { MultiSelectField } from "../MultiSelect";
import { AddNewState } from "./AddNewState";
import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "./context";
import { cssStateToString } from "./utils/cssStateToString";
import { parseAndApplyCssRules } from "./utils/parseAndApplyCssRules";
const defaultStateLabel = "Default State";
function getOptions(cssState: CSSStore) {
  const pseudoClasses = ["", ":active", ":hover", ":focus", ":disabled", ":visited", ":focus-within", ":focus-visible", ":target"];
  const uniqueStates = new Set([...Object.keys(cssState), ...pseudoClasses]);

  return Array.from(uniqueStates).map(value => {
    const label = value in cssState 
      ? `${value === '' ? defaultStateLabel : value} (${Object.values(cssState[value]).length})` 
      : value;
    return { label, value };
  });
}

export function TabsContainer(props: Readonly<{ setValue?: (data: CSSStore) => void; }>) {
  const [state, setState] = useContext(CssStateContext);
  const [cssState, setCssState] = useContext(CssEditorContext);
  const [cssDefaultState, setCssDefaultCssState] = useContext(CssDefaultEditorContext);
  const [showDropdown, setShowDropdown] = createSignal(false);
  let buttonRef: HTMLInputElement;

  function getSelectedValues( ) {
    const label = state() in cssState 
        ? `${state() === '' ? defaultStateLabel : state()} (${Object.values(cssState[state()]).length})` 
        : state();
    return [  { label, value: state() }];
  }

  const handleCSSStateChange = (valueString: string) => {
    setCssState(reconcile(parseAndApplyCssRules(valueString)));
    props.setValue?.(JSON.parse(JSON.stringify(cssState)));
  };

  const handleDefaultStateChange = (valueString: string) => {
    // setCssDefaultCssState(reconcile(parseAndApplyCssRules(valueString)));
  };

  const handleAddNewClick = () => {
    setShowDropdown(!showDropdown());
  };
  const removeState = () => {
    // @ts-expect-error clear the state
    setCssState(state(), undefined);
    setState('');
  };

  return (
    <Tabs style={{ padding: "10px" }}>
      <TabList class={"m:5px"}>
        <Tab class={"w:50%"}>Design</Tab>
        <Tab class={"w:50%"}>Code</Tab>
      </TabList>
      <TabContainer>

        <Container>
          <div class="block p:20px|10px|0px|10px w:inherit">
            Current State
            <div class="flex" ref={buttonRef!}>
              <MultiSelectField
                onRemove={() => setState('')}
                onSelect={(_, value) => setState(value as string)}
                options={getOptions(cssState)}
                placeholder="Select Current State"
                selectedValues={getSelectedValues}
                selectionLimit={1} />
              <Show when={state() !== ""}>
                <button onClick={removeState} title="Remove State">
                  <Icon height={21} icon="ic:round-remove" width={21} />
                </button>
              </Show>
              <button onClick={handleAddNewClick} title="Add New State">
                <Icon height={21} icon="ic:round-add" width={21} />
              </button>
              <Show when={showDropdown()}>
                <DropdownMenu class="r:5" onClickOutside={() => setShowDropdown(false)} parentRef={buttonRef!}>
                  <AddNewState onClose={() => setShowDropdown(false)} />
                </DropdownMenu>
              </Show>
            </div>

            <StyleEditor />
          </div>
        </Container>
      </TabContainer>
      <TabContainer>
        <Container>
          <div class="content mt:5">
            Default Value(Read only)
            <TextEditor
              onValueChange={handleDefaultStateChange}
              value={cssStateToString(cssDefaultState)} />
            Property value
            <TextEditor
              onValueChange={handleCSSStateChange}
              value={cssStateToString(cssState)} />
          </div>
        </Container>
      </TabContainer>
    </Tabs>
  );
}
