import { autoUpdate } from '@floating-ui/dom';
import { Icon } from "@iconify-icon/solid";
import { useFloating } from 'solid-floating-ui';
import {
  For,
  type JSX,
  Show,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import { Portal, } from "solid-js/web";

import { useToast } from "./Toast";

// similar like this: https://www.npmjs.com/package/druthers?activeTab=code
export function MultiSelectField(props: Readonly<{
   disable?: boolean;
   displayValueChild?: string;
   displayValueParent?: string;
   isLoadingOptions?: boolean;
   loadOptions?: () => Promise<void>;
   onRemove: (arg0: any, arg1: any) => void;
   onSelect: (arg0: any, arg1: any) => void;
   options: any[];
   placeholder?: string;
   renderLabel?: ((arg0: any) => JSX.Element);
   selectedValues: () => any;
   selectionLimit?: number;
}>) {
  const { showErrorToast } = useToast();
  let inputRef: HTMLInputElement | undefined;

  const [isRefetch, setIsRefetch] = createSignal(1);

  // Define signals for managing state
  const selected = createMemo(
    () => (isRefetch() && props.selectedValues()) || ([] as any[]),
  );

  const [inputValue, setInputValue] = createSignal("");
  const [dropdownVisible, setDropdownVisible] = createSignal(false);


  const getOptionValue = (option: { [x: string]: { [x: string]: any }; value: any }) => {
    if (props.optionValueKey) {
      return option[props.optionValueKey];
    }
    return typeof option === "object" ? option.value : option;
  };

  const getOptionLabel = (option: { [x: string]: { [x: string]: any }; label: any }) => {
    if (typeof option === "object" && props.displayValueParent && props.displayValueChild) {
      return (
        option[props.displayValueParent]?.[props.displayValueChild] ||
        option[props.displayValueParent]?.name
      );
    } else if (typeof option === "object" && props.displayValueChild) {
      return option[props.displayValueChild];
    }
    return typeof option === "object" ? option.label : option;
  };


  // Handle changes in selection
  const handleSelectChange = (value: any) => {
    let newSelected: any[];
    if (selected().some((item: any) => getOptionValue(item) === value)) {
      newSelected = selected().filter(
        (item: any) => getOptionValue(item) !== value,
      );
      
      props.onRemove?.(newSelected, value);
    } else {
      if (props.selectionLimit && selected().length >= props.selectionLimit) {
        showErrorToast("Selection limit reached");
        setDropdownVisible(false);
        return; // Exit if selection limit is reached
      }
      const selectedOption = (props.options || []).find(
        (option: any) => getOptionValue(option) === value,
      );
      newSelected = [...selected(), selectedOption];
      
      props.onSelect?.(newSelected, value);
    }
    if (props.selectionLimit === 1) {
      setDropdownVisible(false);
    }
    setIsRefetch((v) => v + 1);
  };
  // Remove tag from selected values
  const handleRemoveTag = (value: any) => {
    const newSelected = selected().filter(
      (item: any) => getOptionValue(item) !== value,
    );
    
    props.onRemove?.(newSelected, value);
  };

  // Inline styles
  const containerStyle =
    "position:relative; display: inline-block; width: 100%; padding: 0px 3px; border: 1px solid #ccc; border-radius: 4px; background: white;";
  const inputContainerStyle =
    "padding:4px 0px;display: flex; flex-wrap: wrap; align-items: center; gap: 5px; width: 100%;";
  const tagStyle =
    "background: #3377cc;color: #fff; padding: 2px 5px; border-radius: 4px; display: flex; align-items: center; gap: 5px; cursor: default;";
  const closeButtonStyle = "cursor: pointer; display: flex;";
  const inputStyle = () => ({
    border: "none",
    display:
      props.selectedValues().length === 1 && props.selectionLimit === 1
        ? "none"
        : "",
    flex: 1,
    outline: "none",
    padding: "5px",
    "smin-width": "100px",
  });

  const optionStyle = "padding: 8px; cursor: pointer; width: 100%;";
  const optionSelectedStyle = "background: #ddd;opacity: 0.5;";

  // Filter options based on input value
  const filterOptions = (options: any[], inputValue: string) => {
    return options.filter((option) => {
      const label = getOptionLabel(option)?.toLowerCase();
      const matches = label.includes(inputValue.toLowerCase());
      const children = option.children ? filterOptions(option.children, inputValue) : [];
      return matches || children.length > 0;
    });
  };

  const filteredOptions = createMemo(() => {
    return filterOptions(props.options || [], inputValue());
  });

  const handleInputFocus = (e: Event) => {
    setDropdownVisible(true);
    if (!props.isLoadingOptions) {
      props.loadOptions?.();
    }
  };

  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  const Options = () => {
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);

    const position = useFloating(reference, floating, {
      placement: 'bottom-start', // By default, this is 'bottom'
      strategy: 'fixed',
      whileElementsMounted: autoUpdate,
    });
    const handleClickOutside = (event: MouseEvent) => {
      const path = event.composedPath();
      if (path.includes(reference()!) || path.includes(floating()!)) {
        return;
      }
      setDropdownVisible(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    onCleanup(() => {
      document.removeEventListener("mousedown", handleClickOutside);
    });

    const Option = (p: { option: any }) => {
      return (
        <Show
          fallback={
            <button
              class="bg:#e0e0e0:hover f:14 m:3 r:5 w:full"
              onMouseDown={() => !p.option.children && handleSelectChange(getOptionValue(p.option))}
              style={`${optionStyle} ${selected().some(
                (item: { value: any }) =>
                  getOptionValue(item) === getOptionValue(p.option),
              )
                ? optionSelectedStyle
                : ""
                }`}
              type="button"
            >
              {props.renderLabel
                ? props.renderLabel(p.option)
                : getOptionLabel(p.option)}
            </button>
          }
          when={p.option.children && p.option.children.length > 0}
        >
          <div>
            <div
              class="bg:#e0e0e0:hover f:14 m:3 r:5 w:full"
              onMouseDown={() => handleSelectChange(getOptionValue(p.option))}
              style={`${optionStyle} ${selected().some(
                (item: { value: any }) =>
                  getOptionValue(item) === getOptionValue(p.option),
              )
                ? optionSelectedStyle
                : ""
                }`}
            >
              {props.renderLabel
                ? props.renderLabel(p.option)
                : getOptionLabel(p.option)}
            </div>
            <div style="padding-left: 20px;">
              <For each={p.option.children}>
                {(childOption) => Option({ option: childOption })}
              </For>
            </div>
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
          <Show fallback={<div style={optionStyle}>Loading...</div>} when={!props.isLoadingOptions}>
            <For
              each={filteredOptions()}
              fallback={<div style={optionStyle}>No item found </div>}
            >
              {(option) => <Option option={option} />}
            </For>
          </Show>
        </div>
      </Portal>
    )
  }

  return (
    <div class="grid text-align:left" ref={setReference} style={containerStyle}>
      <div style={inputContainerStyle}>
        <For each={selected()}>
          {(tag) => (
            <div class="f:14" style={tagStyle}>
              {props.renderLabel ? props.renderLabel(tag) : getOptionLabel(tag)}
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return handleRemoveTag(getOptionValue(tag));
                }}
                style={closeButtonStyle}
              >
                <Icon height={21} icon="ic:round-close" width={21} />
              </span>
            </div>
          )}
        </For>
        <input
          auto-complete="off"
          disabled={props.disable}
          onFocus={handleInputFocus}
          onInput={(e) => setInputValue(e.target.value)}
          placeholder={props.placeholder ?? "Select options"}
          ref={inputRef}
          style={inputStyle()}
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
