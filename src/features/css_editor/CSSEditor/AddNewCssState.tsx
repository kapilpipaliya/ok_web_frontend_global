import { Icon } from "@iconify-icon/solid";
import { createSignal } from "solid-js";

import { IframeHelpDialog } from "~/components/styled/modal/IframeHelpDialog";
import { MultiSelectField, type Option } from "~/components/styled/MultiSelect";
import { cssSelectorTree } from "~/features/css_editor/constants/StateSelector";
import { PROPERTIES } from "~/pages/settings/constants";

import { useCssEditor } from "../context/CssEditorContext";
import { useCssState } from "../context/CssStateContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function AddNewCssState(props: Readonly<{ onClose: () => void }>) {
  const [selectedAllState, setSelectedAllState] = createSignal<Option[]>([]);
  const [stateName, setStateName] = createSignal("");
  const [cssState, setCssState] = useCssEditor();
  const [, setState] = useCssState();

  let inputRef: HTMLTextAreaElement;

  const addNewState = () => {
    if (!cssState[stateName()]) {
      setCssState(stateName(), {});
    }
    setSelectedAllState([]);
    setState(stateName());
    props.onClose();
  };

  return (
    <As
      as="div"
      css={css`
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  display: flex;
  flex-direction: column;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 5px;
  padding-bottom: 5px;
`}
    >
      <span>Add New State</span>
      <As
        as="div"
        css={css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: space-between;
  margin-top: 10px;
`}
      >
        <As
          as="label"
          css={css`
  display: flex;
  flex-direction: column;
`}
        >
          Enter States
          <As
            as="div"
            css={css`
  align-items: center;
  display: flex;
  height: 100%;
`}
          >
            <As
              as="textarea"
              css={[
                PROPERTIES.Css.TextFieldCss,
                css`
  height: 100%;
`,
              ]}
              onInput={(e) => setStateName(e.target.value)}
              placeholder="Enter State Name"
              ref={inputRef!}
              value={stateName()}
            />
            <IframeHelpDialog
              icon="material-symbols:help-outline"
              iframeSrc="https://rc.css.master.co/guide/state-selectors"
              iframeTitle="State Selectors"
              title="State Selectors"
            />
          </As>
        </As>
        <As
          as="label"
          css={css`
  display: flex;
  flex-direction: column;
`}
        >
          Find and add State Name
          <As
            as="div"
            css={css`
  align-items: center;
  display: flex;
`}
          >
            <MultiSelectField
              displayValueKey="title"
              onRemove={() => {
                setSelectedAllState([]);
              }}
              onSelect={(value) => {
                setSelectedAllState(value);
                const joinedState = selectedAllState()
                  // @ts-expect-error ignore
                  .map((option) => option.selector)
                  .join("");
                if (!stateName().includes(joinedState)) {
                  setStateName((prev) => `${prev}${joinedState}`);
                  // move text input cursor to the end
                }
                setSelectedAllState([]);
              }}
              options={cssSelectorTree as unknown as Option[]}
              optionValueKey="selector"
              selectedValues={selectedAllState}
              selectionLimit={1}
            />
          </As>
        </As>

        <As as="button" onClick={addNewState}>
          <As
            as={Icon}
            css={css`
  margin-left: 2px;
`}
            height={21}
            icon="ic:round-check"
            noobserver
            width={21}
          />
        </As>
      </As>
    </As>
  );
}
