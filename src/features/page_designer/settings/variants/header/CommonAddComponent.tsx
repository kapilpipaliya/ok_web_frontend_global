import { createSignal, type JSX, onMount } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { PROPERTIES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function CommonAddComponent(
  props: Readonly<{
    addNewState: (key: string) => void;
    children?: JSX.Element;
    label: string;
    onClose: (rowVertex?: Vertex) => void;
    placeholder: string;
    title: string;
  }>,
) {
  const [stateName, setStateName] = createSignal("");
  let inputRef: HTMLInputElement;

  onMount(() => inputRef?.focus());

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      props.addNewState(stateName());
    }
  };

  return (
    <As as="div" css={css`
  /* radius-b: 5; */
  display: flex;
  flex-direction: column;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 5px;
  padding-bottom: 5px;
`}>
      <span>{props.title}</span>
      <As as="div" css={css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: space-between;
  margin-top: 10px;
`}>
        <As as="label" css={css`
  display: flex;
  flex-direction: column;
`}>
          {props.label}
          <As as="div" css={css`
  align-items: center;
  display: flex;
`}>
            <As as="input"
              css={[
                PROPERTIES.Css.TextFieldCss,
                css`
  height: 100%;
`
              ]}
              onInput={(e) => setStateName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={props.placeholder}
              ref={inputRef!}
              value={stateName()}
            />
          </As>
        </As>
        <IconButton
          icon="ic:round-check"
          iconCss={css`margin-left: 2px;`}
          onClick={() => props.addNewState(stateName())}
          size={21}
        />
        {props.children}
      </As>
    </As>
  );
}
