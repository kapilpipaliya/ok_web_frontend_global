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

import { useZIndex, ZIndex } from "../fields/ZIndex";
import { STYLES } from "./constants/styles";
import { DropdownMenu } from "./DropdownMenu";
import { IconButton } from "./IconButton";
import { useToast } from "./Toast";

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
            <div
              class="bg:primary-10:hover cursor:pointer f:14 m:3 p:8px r:5 t:left"
              classList={{
                "bg:primary-20": selectedValue().some(
                  (item) => getOptionValue(item) === getOptionValue(p.option),
                ),
              }}
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
            </div>
          }
          when={hasChildren()}
        >
          <div>
            <div // NOSONAR
              class="flex ai:center bg:primary-10:hover cursor:pointer f:14 gap:2 m:3 p:8px r:5 t:left"
              classList={{
                "bg:primary-20": selectedValue().some(
                  (item) => getOptionValue(item) === getOptionValue(p.option),
                ),
              }}
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
            </div>
            <Show when={isExpanded()}>
              <div class="pl:20px">
                {/* @ts-expect-error ignore */}
                <For each={p.option[childrenKey()]}>
                  {(childOption) => Option({ option: childOption })}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      );
    };

    return (
      <div
        class={`radius:5 flex bg:base-5 flex:column max-h:200px ${STYLES.overflow} w:100% z-index:${zIndex}`}
      >
        <Show
          fallback={<div class="cursor:pointer p:8px w:100%">Loading...</div>}
          when={!props.isLoadingOptions}
        >
          <For
            each={filteredOptions()}
            fallback={
              <div class="cursor:pointer p:8px w:100%">No item found </div>
            }
          >
            {(option) => <Option option={option} />}
          </For>
        </Show>
      </div>
    );
  };

  return (
    <div
      class={`pos:relative b:1px|solid|base  p:0px|3px r:4px text-align:left w:100% ${props.class}`}
      classList={{
        "b:1px|solid|error": !!props.error,
      }}
      ref={mergeRefs<HTMLDivElement>(props.ref, setReference)}
    >
      <div
        class={`${props.selectionLimit !== 1 ? "flex:wrap" : ""} ai:center d:flex gap:5px p:4px|0px w:100%`}
      >
        <For each={selectedValue()}>
          {(tag) => (
            <div class="ai:center bg:primary-20 cursor:default d:flex f:14 gap:5px p:2px|5px r:4px">
              <span class="white-space:nowrap">
                {props.renderLabel
                  ? props.renderLabel(tag, true)
                  : getOptionLabel(tag)}
              </span>
              <IconButton
                icon="ph:x"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return handleRemoveTag(getOptionValue(tag));
                }}
                size={16}
              />
            </div>
          )}
        </For>
        <div class="flex ai:center flex:1">
          <input
            auto-complete="off"
            class={`${props.selectionLimit === 1 && selectedValue().length === 1 ? "w:100px" : "min-w:100px"} border:none flex:1 outline:none p:5`}
            data-lpignore="true"
            disabled={props.disable}
            onFocus={handleInputFocus}
            onInput={(e) => setInputValue(e.target.value)}
            placeholder={props.placeholder ?? "Select options"}
            ref={inputRef}
            type="text"
            value={inputValue()}
          />
          <Icon
            class="mr:5 c:base-50"
            icon={dropdownVisible() ? "ph:caret-up-bold" : "ph:caret-down-bold"}
            width={20}
          />
        </div>
      </div>
      <Show when={props.error}>
        <div class="fg:error f:12 p:2px">{props.error}</div>
      </Show>
      <Show when={dropdownVisible()}>
        <ZIndex>
          <DropdownMenu
            class="r:5"
            onClickOutside={() => setDropdownVisible(false)}
            parentRef={reference()!}
          >
            <Options />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </div>
  );
}
