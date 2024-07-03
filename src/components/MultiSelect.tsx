import { autoUpdate } from '@floating-ui/dom';
import { Icon } from "@iconify-icon/solid";
import { type Ref, mergeRefs } from "@solid-primitives/refs";
import { useFloating } from 'solid-floating-ui';
import {
  For,
  type JSX,
  Show,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";
import { Portal, } from "solid-js/web";

import { useActiveClickOutside } from "~/components/useActiveClickOutside";
import { GraphContext, type Vertex } from '~/lib/graph/graph';
import { isObject } from '~/lib/utils';

import { useToast } from "./Toast";

export type Option = {
  children?: Option[];
  label: string;
  value: string;
} | Vertex | string;
// similar like this: https://www.npmjs.com/package/druthers?activeTab=code
export function MultiSelectField(props: Readonly<{
  disable?: boolean;
  displayValueChild?: string;
  displayValueParent?: string;
  isLoadingOptions?: boolean;
  loadOptions?: () => Promise<void>;
  onRemove: (newSelected: Option[], value: Option) => void;
  onSelect: (newSelected: Option[], value: Option) => void;
  optionValueKey?: string;
  options: Option[];
  placeholder?: string;
  ref?: Ref<HTMLDivElement>;
  renderLabel?: ((option: Option) => JSX.Element);
  selectedValues: () => Option[];
  selectionLimit?: number;
}>) {
  const { showErrorToast } = useToast();
  let inputRef: HTMLInputElement | undefined;
  let optionTimeout: NodeJS.Timeout;

  const [isReFetchSelectedValues, setIsReFetchSelectedValues] = createSignal(1);

  // Define signals for managing state
  const selected = createMemo(
    () => (isReFetchSelectedValues() && props.selectedValues()) || ([] as Option[]),
  );

  const [inputValue, setInputValue] = createSignal("");
  const [dropdownVisible, setDropdownVisible] = createSignal(false);

  const getOptionValue = (option: Option) => {
    if (!isObject(option)) return option;
    if (props.optionValueKey) {
      return option[props.optionValueKey as keyof Option];
    }
    // @ts-expect-error ignore
    return option.value;
  };

  const getOptionLabel = (option: Option) => {
    if (isObject(option) && props.displayValueParent && props.displayValueChild) {
      return (
        // @ts-expect-error ignore
        option[props.displayValueParent]?.[props.displayValueChild] ||
        // @ts-expect-error ignore
        option[props.displayValueParent]?.name
      );
    } else if (isObject(option) && props.displayValueChild) {
      // @ts-expect-error ignore
      return option[props.displayValueChild];
    }
    // @ts-expect-error ignore
    return isObject(option) ? option.label : option;
  };

  // Remove tag from selected values
  const handleRemoveTag = (option: Option) => {
    const newSelected = selected().filter(
      (item) => getOptionValue(item) !== option,
    );

    props.onRemove?.(newSelected, option);
  };

  // Master CSS classes
  const inputContainerClass = "p:4px|0px d:flex flex:wrap ai:center gap:5px w:100%";
  const tagClass = "bg:#3377cc c:#fff p:2px|5px r:4px d:flex ai:center gap:5px cursor:default";
  const closeButtonClass = "cursor:pointer d:flex";

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

      // @ts-expect-error ignore
      if (option.children && option.children.length > 0) {
        // @ts-expect-error ignore
        const originalOptions = JSON.parse(JSON.stringify(option.children));
        // @ts-expect-error ignore
        const filteredChildren = filterOptions(option.children, inputValue);

        if (matches && filteredChildren.length === 0) {
          // If the parent matches and no children match, include all children
          // @ts-expect-error ignore
          option.children = originalOptions;
          return true;
        } else {
          // Otherwise, filter the children
          // @ts-expect-error ignore
          option.children = filteredChildren;
          // Include the parent if it matches or any children match
          // @ts-expect-error ignore
          return matches || option.children.length > 0;
        }
      }

      // Return true if the parent matches and there are no children
      return matches;
    });
  };

  const handleInputFocus = () => {
    if (dropdownVisible()) {
      clearTimeout(optionTimeout);
    }
    else {
      setDropdownVisible(true);
      if (!props.isLoadingOptions) {
        props.loadOptions?.();
      }
    }
  };

  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  const Options = () => {
    const [graph, setGraph] = useContext(GraphContext)!;
    useActiveClickOutside(graph, setGraph);
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);
    const [hiddenOptions, setHiddenOptions] = createSignal<Set<Option>>(new Set());

    const optionClass = "p:8px cursor:pointer w:100%";
    const optionSelectedClass = "bg:#ddd opacity:0.5";

    // Handle changes in selection
    const handleSelectChange = (option: Option) => {
      const value = getOptionValue(option);
      let newSelected: Option[];
      if (selected().some((item) => getOptionValue(item) === value)) {
        newSelected = selected().filter(
          (item) => getOptionValue(item) !== value,
        );

        props.onRemove?.(newSelected, value);
      } else {
        if (props.selectionLimit && props.selectionLimit > 1 && selected().length >= props.selectionLimit) {
          showErrorToast("Selection limit reached");
          setDropdownVisible(false);
          return; // Exit if selection limit is reached
        }
        if (props.selectionLimit === 1) {
          newSelected = [option];
        } else {
          newSelected = [...selected(), option];
        }

        props.onSelect?.(newSelected, value);
      }

      if (props.selectionLimit === 1) {
        setDropdownVisible(false);
      }
      setInputValue(""); // mostimes user wants to clear the input after selecting an option
      if (props.selectionLimit !== 1) {
        inputRef?.focus();
      }

      setIsReFetchSelectedValues((v) => v + 1);
    };

    const toggleExpandOption = (option: Option) => {
      const newHiddenOptions = new Set(hiddenOptions());
      if (newHiddenOptions.has(option)) {
        newHiddenOptions.delete(option);
      } else {
        newHiddenOptions.add(option);
      }
      setHiddenOptions(newHiddenOptions);
    };

    const filteredOptions = createMemo(() => {
      return filterOptions(JSON.parse(JSON.stringify(props.options || [])), inputValue());
    });
    const position = useFloating(reference, floating, {
      placement: 'bottom-start', // By default, this is 'bottom'
      strategy: 'fixed',
      whileElementsMounted: autoUpdate,
    });

    const Option = (p: { option: Option }) => {
      const isExpanded = () => !hiddenOptions().has(p.option);
      return (
        <Show
          fallback={
            <button
              class="bg:#e0e0e0:hover f:14 m:3 r:5 t:left w:full"
              classList={{
                [optionClass]: true, [optionSelectedClass]: selected().some(
                  (item) =>
                    getOptionValue(item) === getOptionValue(p.option),
                )
              }}
              // @ts-expect-error ignore
              onClick={() => (!p.option.children || p.option.children.length === 0) && handleSelectChange(p.option)}
              type="button"
            >
              {props.renderLabel
                ? props.renderLabel(p.option)
                : getOptionLabel(p.option)}
            </button>
          }
          // @ts-expect-error ignore
          when={p.option.children && p.option.children.length > 0}
        >
          <div>
            <button class="bg:#e0e0e0:hover f:14 m:3 r:5 t:left w:full"
              classList={{
                [optionClass]: true, [optionSelectedClass]: selected().some(
                  (item) =>
                    getOptionValue(item) === getOptionValue(p.option),
                )
              }}
              onClick={() => toggleExpandOption(p.option)}
              type="button"
            >
              {isExpanded() ? '-' : '+'} {props.renderLabel
                ? props.renderLabel(p.option)
                : getOptionLabel(p.option)}
            </button>
            <Show when={isExpanded()}>
              <div class="p-l:20px">
                {/* @ts-expect-error ignore */}
                <For each={p.option.children}>
                  {(childOption) => Option({ option: childOption })}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      );
    };

    return (
      <Portal mount={document.body}>
        {/* z-index greater than drawers z-index */}
        <div class="radius:5 bg:#f4f4f4 max-h:200px overflow:auto z-index:1001" ref={setFloating} style={{
          left: `${position.x ?? 0}px`,
          position: position.strategy,
          top: `${position.y ?? 0}px`,
        }}>
          <Show fallback={<div class={optionClass}>Loading...</div>} when={!props.isLoadingOptions}>
            <For
              each={filteredOptions()}
              fallback={<div class={optionClass}>No item found </div>}
            >
              {(option) => <Option option={option} />}
            </For>
          </Show>
        </div>
      </Portal>
    )
  }

  return (
    <div
      class="pos:relative grid b:1px|solid|#ccc bg:white p:0px|3px r:4px text-align:left w:100%"
      ref={mergeRefs<HTMLDivElement>(props.ref, setReference)}>
      <div class={inputContainerClass}>
        <For each={selected()}>
          {(tag) => (
            <div class={`${tagClass} f:14`}>
              {props.renderLabel ? props.renderLabel(tag) : getOptionLabel(tag)}
              <button
                class={closeButtonClass}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return handleRemoveTag(getOptionValue(tag));
                }}
                type="button"
              >
                <Icon height={21} icon="ic:round-close" width={21} />
              </button>
            </div>
          )}
        </For>
        {/* ${props.selectedValues().length === 1 && props.selectionLimit === 1 ? "display:none" : ""} */}
        <input
          // @ts-expect-error disable lastpass
          AutoComplete="off"
          auto-complete="off"
          class={`border:none flex:1 min-w:100px outline:none p:5`}
          disabled={props.disable}
          onBlur={() => {
            if (dropdownVisible()) {
              // This is working fine, but its giving some bad user experience.
              optionTimeout = setTimeout(() => setDropdownVisible(false), 100);
              if (props.selectionLimit === 1) {
                setInputValue('');
              }
            }
          }}
          onFocus={handleInputFocus}
          onInput={(e) => setInputValue(e.target.value)}
          placeholder={props.placeholder ?? "Select options"}
          ref={inputRef}
          type="text"
          value={inputValue()}
        />
      </div>
      <Show when={dropdownVisible()}>
        <Options />
      </Show>
    </div>
  );
}
