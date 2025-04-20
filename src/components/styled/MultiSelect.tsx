import { Icon } from "@iconify-icon/solid";
import { mergeRefs, type Ref } from "@solid-primitives/refs";
import {
  createMemo,
  createSignal,
  For,
  getOwner,
  type JSX,
  runWithOwner,
  Show,
} from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { isObject } from "~/lib/data_structure/object/isObject";
import { evalExpression } from "~/lib/expression_eval";
import { STYLES } from "~/pages/settings/constants";

import { useZIndex, ZIndex } from "../fields/ZIndex";
import { IconButton } from "./IconButton";
import { DropdownMenu } from "./modal/DropdownMenu";
import { useToast } from "./modal/Toast";
import { css } from "~/lib/styles";
import { As } from "../As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

export type Option =
  | string
  | Vertex
  | {
      children?: Option[];
      id: string;
      label: string;
    };

// similar like this: https://www.npmjs.com/package/druthers?activeTab=code
export function MultiSelectField(
  props: Readonly<{
    childrenKey?: string;
    class?: string;
    disable?: boolean;
    displayValueKey?: string;
    error?: string;
    isLoadingOptions?: boolean;
    loadOptions?: () => Promise<void>;
    onRemove: (newSelected: Option[], value: Option) => void;
    onSelect: (newSelected: Option[], value: Option) => void;
    options: Option[];
    optionValueKey?: string;
    placeholder?: string;
    ref?: Ref<HTMLDivElement>;
    renderLabel?: (option: Option, isSelected: boolean) => JSX.Element;
    selectedValues: () => Option[];
    selectionLimit?: number;
  }>,
) {
  const { showErrorToast } = useToast();
  let inputRef: HTMLInputElement | undefined;
  let optionTimeout: NodeJS.Timeout | undefined;
  const owner = getOwner();

  const [isReFetchSelectedValues, setIsReFetchSelectedValues] = createSignal(1);

  // Define signals for managing state
  const selectedValue = createMemo(
    () =>
      (isReFetchSelectedValues() && props.selectedValues()) || ([] as Option[]),
  );

  const [inputValue, setInputValue] = createSignal("");
  const [dropdownVisible, setDropdownVisible] = createSignal(false);

  const getOptionValue = (option: Option) => {
    if (!isObject(option)) {
      return option;
    }
    if (props.optionValueKey) {
      return option[props.optionValueKey as keyof Option];
    }
    return (option as { id: string }).id;
  };

  const getOptionLabel = (option: Option) => {
    if (isObject(option) && props.displayValueKey) {
      if (props.displayValueKey.includes("::")) {
        return evalExpression(props.displayValueKey, option);
      }
      return option[props.displayValueKey as keyof Option];
    }
    // @ts-expect-error ignore
    return isObject(option) ? option.label : option;
  };

  // Remove tag from selected values
  const handleRemoveTag = (option: Option) => {
    runWithOwner(owner, () => {
      const newSelected = selectedValue().filter(
        (item) => getOptionValue(item) !== option,
      );

      props.onRemove?.(newSelected, option);
    });
  };

  // Filter options based on input value
  const filterOptions = (options: Option[], inputValue: string) => {
    return options.filter((option) => {
      if (!option) {
        return false;
      }
      if (!isObject(option)) {
        return option.toLowerCase().includes(inputValue.toLowerCase());
      }
      const label = getOptionLabel(option)?.toLowerCase();
      const matches = label?.includes(inputValue.toLowerCase());

      const childrenKey = props.childrenKey || "children";
      // @ts-expect-error ignore
      if (option[childrenKey] && option[childrenKey].length > 0) {
        // @ts-expect-error ignore
        const originalOptions = JSON.parse(JSON.stringify(option[childrenKey]));
        // @ts-expect-error ignore
        const filteredChildren = filterOptions(option[childrenKey], inputValue);

        if (matches && filteredChildren.length === 0) {
          // If the parent matches and no children match, include all children
          // @ts-expect-error ignore
          option[childrenKey] = originalOptions;
          return true;
        }
        // Otherwise, filter the children
        // @ts-expect-error ignore
        option[childrenKey] = filteredChildren;
        // Include the parent if it matches or any children match
        // @ts-expect-error ignore
        return matches || option[childrenKey].length > 0;
      }

      // Return true if the parent matches and there are no children
      return matches;
    });
  };

  const handleInputFocus = () => {
    runWithOwner(owner, () => {
      if (dropdownVisible()) {
        clearTimeout(optionTimeout);
      } else {
        setDropdownVisible(true);
        if (!props.isLoadingOptions) {
          props.loadOptions?.();
        }
      }
    });
  };

  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  const Options = () => {
    const zIndex = useZIndex();
    const [hiddenOptions, setHiddenOptions] = createSignal<Set<Option>>(
      new Set(),
    );

    // Handle changes in selection
    const handleSelectChange = (option: Option) => {
      runWithOwner(owner, () => {
        const value = getOptionValue(option);
        let newSelected: Option[];
        if (selectedValue().some((item) => getOptionValue(item) === value)) {
          newSelected = selectedValue().filter(
            (item) => getOptionValue(item) !== value,
          );

          props.onRemove?.(newSelected, value);
        } else {
          if (
            props.selectionLimit &&
            props.selectionLimit > 1 &&
            selectedValue().length >= props.selectionLimit
          ) {
            showErrorToast("Selection limit reached");
            setDropdownVisible(false);
            return; // Exit if selection limit is reached
          }
          if (props.selectionLimit === 1) {
            newSelected = [option];
          } else {
            newSelected = [...selectedValue(), option];
          }

          props.onSelect?.(newSelected, value);
        }

        if (props.selectionLimit === 1) {
          setDropdownVisible(false);
        }
        setInputValue(""); // mostimes user wants to clear the input after selecting an option
        if (props.selectionLimit !== 1) {
          // if we don't focus options list will be closed.
          inputRef?.focus();
        }

        setIsReFetchSelectedValues((v) => v + 1);
      });
    };

    const toggleExpandOption = (option: Option) => {
      runWithOwner(owner, () => {
        const newHiddenOptions = new Set(hiddenOptions());
        if (newHiddenOptions.has(option)) {
          newHiddenOptions.delete(option);
        } else {
          newHiddenOptions.add(option);
        }
        setHiddenOptions(newHiddenOptions);
        // if we don't focus options list will be closed.
        inputRef?.focus();
      });
    };

    const filteredOptions = createMemo(() => {
      return filterOptions(
        JSON.parse(JSON.stringify(props.options || [])),
        inputValue(),
      );
    });

    const Option = (p: { option: Option }) => {
      const isExpanded = () => !hiddenOptions().has(p.option);
      const childrenKey = () => props.childrenKey || "children";
      const hasChildren = () => {
        const option = p.option as { [key: string]: unknown };
        const children = option[childrenKey()];
        return Array.isArray(children) && children.length > 0;
      };

      return (
        <Show
          fallback={
            <As
              as="div"
              css={({ theme }) => css`
  cursor: pointer;
  font-size: 14px;
  margin: 3px;
  padding: 8px;
  border-radius: 5px;
  ${
    selectedValue().some(
      (item) => getOptionValue(item) === getOptionValue(p.option),
    )
      ? `background-color: ${theme.var.color.primary_80};`
      : ""
  }
  &:hover {
    background-color: ${theme.var.color.primary_40};
  }
`}
              onClick={() =>
                runWithOwner(owner, () => {
                  if (!hasChildren()) {
                    handleSelectChange(p.option);
                  }
                })
              }
            >
              {" "}
              {props.renderLabel
                ? props.renderLabel(p.option, false)
                : getOptionLabel(p.option)}
            </As>
          }
          when={hasChildren()}
        >
          <div>
            <As
              as="div"
              css={({ theme }) => css`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  gap: 2px;
  margin: 3px;
  padding: 8px;
  border-radius: 5px;
  ${
    selectedValue().some(
      (item) => getOptionValue(item) === getOptionValue(p.option),
    )
      ? `background-color: ${theme.var.color.primary_80};`
      : ""
  }
  &:hover {
    background-color: ${theme.var.color.primary_40};
  }
`}
              onClick={() => toggleExpandOption(p.option)}
            >
              <Icon
                icon={
                  isExpanded() ? "ph:caret-down-bold" : "ph:caret-right-bold"
                }
                noobserver
              />
              <span>
                {props.renderLabel
                  ? props.renderLabel(p.option, false)
                  : getOptionLabel(p.option)}
              </span>
            </As>
            <Show when={isExpanded()}>
              <As
                as="div"
                css={css`
  padding-left: 20px;
`}
              >
                {/* @ts-expect-error ignore */}
                <For each={p.option[childrenKey()]}>
                  {(childOption) => Option({ option: childOption })}
                </For>
              </As>
            </Show>
          </div>
        </Show>
      );
    };

    return (
      <As
        as="div"
        css={[
          STYLES.overflowCss,
          ({ theme }) => css`
  border-radius: 5px;
  display: flex;
  background-color: ${theme.var.color.base_10};
  display: flex;
  flex-direction: column;
  max-height: 200px;
  width: 100%;
  z-index: ${zIndex};
`,
        ]}
      >
        <Show
          fallback={
            <As
              as="div"
              css={css`
  cursor: pointer;
  padding: 8px;
  width: 100%;
`}
            >
              Loading...
            </As>
          }
          when={!props.isLoadingOptions}
        >
          <For
            each={filteredOptions()}
            fallback={
              <As
                as="div"
                css={css`
  cursor: pointer;
  padding: 8px;
  width: 100%;
`}
              >
                No item found{" "}
              </As>
            }
          >
            {(option) => <Option option={option} />}
          </For>
        </Show>
      </As>
    );
  };

  return (
    <As
      as="div"
      css={[
        ensureArray(props.css),
        css`
  border: 1px solid \${args.theme.var.color.base};
  padding: 0 3px;
  border-radius: 4px;
  text-align: left;
  width: 100%;
  ${props.error ? "border: 1px solid ${args.theme.var.color.error};" : ""}
`,
      ]}
      ref={mergeRefs<HTMLDivElement>(props.ref, setReference)}
    >
      {/* Main grid container */}
      <As
        as="div"
        css={css`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
`}
      >
        {/* Tags and input area */}
        <As
          as="div"
          css={[
            props.selectionLimit !== 1 ? "flex-wrap: wrap" : "",
            css`
  align-items: center;
  display: flex;
  gap: 5px;
  padding: 4px 6px;
  width: 100%;
`,
          ]}
        >
          <For each={selectedValue()}>
            {(tag) => (
              <As
                as="div"
                css={css`
  align-items: center;
  background-color: \${args.theme.var.color.primary_60};
  cursor: default;
  display: flex;
  font-size: 14px;
  gap: 5px;
  padding: 2px 5px;
  border-radius: 4px;
`}
              >
                <As
                  as="span"
                  css={css`
  white-space: nowrap;
`}
                >
                  {props.renderLabel
                    ? props.renderLabel(tag, true)
                    : getOptionLabel(tag)}
                </As>
                <IconButton
                  icon="ph:x"
                  css={css`
    background-color: transparent;
    border: none;
    &:hover {
      color: \${args.theme.var.color.error};
    }
  `}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return handleRemoveTag(getOptionValue(tag));
                  }}
                  size={16}
                />
              </As>
            )}
          </For>
          <As
            as="div"
            css={css`
  display: flex;
  align-items: center;
  flex: 1;
`}
          >
            <As
              as="input"
              auto-complete="off"
              css={[
                css`
  ${props.selectionLimit === 1 && selectedValue().length === 1 ? "width: 100px;" : ""}
  ${props.selectionLimit !== 1 ? "min-width: 100px;" : ""}
  border: none;
  flex: 1;
  outline: none;
  padding: 5px;
`,
              ]}
              data-lpignore="true"
              disabled={props.disable}
              onFocus={handleInputFocus}
              onInput={(e) => setInputValue(e.target.value)}
              placeholder={props.placeholder ?? "Select options"}
              ref={inputRef}
              type="text"
              value={inputValue()}
            />
          </As>
        </As>

        {/* Dropdown icon area */}
        <As
          as="div"
          css={css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 8px;
`}
        >
          <As
            as={Icon}
            css={({ theme }) => css`
  color: ${theme.var.color.base};
  cursor: pointer;
`}
            icon={dropdownVisible() ? "ph:caret-up-bold" : "ph:caret-down-bold"}
            noobserver
            onClick={() => {
              const newState = !dropdownVisible();
              setDropdownVisible(newState);
              if (newState && !props.isLoadingOptions) {
                props.loadOptions?.();
              }
            }}
            width={20}
          />
        </As>
      </As>

      <Show when={props.error}>
        <As
          as="div"
          css={css`
  color: \${args.theme.var.color.error};
  font-size: 12px;
  padding: 2px;
`}
        >
          {props.error}
        </As>
      </Show>

      <Show when={dropdownVisible()}>
        <ZIndex>
          <DropdownMenu
            css={css`
  border-radius: 5px;
`}
            onClickOutside={() => setDropdownVisible(false)}
            parentRef={reference()!}
          >
            <Options />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </As>
  );
}
