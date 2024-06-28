import { Icon } from "@iconify-icon/solid";
import {
  type JSX,
  createSignal,
  For,
  createMemo,
  onCleanup,
  Show,
} from "solid-js";
import { useToast } from "./Toast";
import { Portal, } from "solid-js/web";
import { useFloating } from 'solid-floating-ui';
import { autoUpdate } from '@floating-ui/dom';

// similar like this: https://www.npmjs.com/package/druthers?activeTab=code
export function MultiSelectField(props: {
  readonly selectedValues: () => any;
  readonly options: any[];
  readonly onRemove: (arg0: any, arg1: any) => void;
  readonly onSelect: (arg0: any, arg1: any) => void;
  readonly placeholder?: string;
  readonly disable?: boolean;
  readonly displayValueParent?: string;
  readonly displayValueChild?: string;
  readonly selectionLimit?: number;
  readonly renderLabel?: ((arg0: any) => JSX.Element);
  readonly isLoadingOptions?: boolean;
  readonly loadOptions?: () => Promise<void>;
}) {
  const { showErrorToast } = useToast();
  let inputRef: HTMLInputElement | undefined;

  const [isRefetch, setIsRefetch] = createSignal(1);

  // Define signals for managing state
  const selected = createMemo(
    () => (isRefetch() && props.selectedValues()) || ([] as any[]),
  );

  const [inputValue, setInputValue] = createSignal("");
  const [dropdownVisible, setDropdownVisible] = createSignal(false);

  const getOptionProperty = (option: {
    [x: string]: { [x: string]: any }; // Vertex
    value?: any;
    label?: any;
  }, property: 'value' | 'label') => {
    if (typeof option === "object" && props.displayValueParent && props.displayValueChild) {
      return (
        option[props.displayValueParent]?.[props.displayValueChild] ||
        option[props.displayValueParent]?.name
      );
    }
    return typeof option === "object" ? option[property] : option;
  };

  const getOptionValue = (option: { [x: string]: { [x: string]: any }; value: any; }) => getOptionProperty(option, 'value');
  const getOptionLabel = (option: { [x: string]: { [x: string]: any }; label: any; }) => getOptionProperty(option, 'label');

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
    display:
      props.selectedValues().length === 1 && props.selectionLimit === 1
        ? "none"
        : "",
    flex: 1,
    "smin-width": "100px",
    padding: "5px",
    border: "none",
    outline: "none",
  });

  const optionStyle = "padding: 8px; cursor: pointer; width: 100%;";
  const optionSelectedStyle = "background: #ddd;opacity: 0.5;";

  // Filter options based on input value
  const filteredOptions = createMemo(() => {
    return (props.options || []).filter((option) =>
      getOptionLabel(option)
        ?.toLowerCase()
        .includes(inputValue().toLowerCase()),
    );
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

    return (
      <Portal mount={document.body}>
        {/* z-index greater than drawers z-index */}
        <div ref={setFloating} class="radius:5 bg:#f4f4f4 max-h:200px overflow:auto z-index:21" style={{
          position: position.strategy,
          top: `${position.y ?? 0}px`,
          left: `${position.x ?? 0}px`,
        }}>
          <Show when={!props.isLoadingOptions} fallback={<div style={optionStyle}>Loading...</div>}>
            <For
              each={filteredOptions()}
              fallback={<div style={optionStyle}>No item found </div>}
            >
              {(option, index) => (
                <div
                  class={`bg:#f4f4f4:hover ${index() === filteredOptions().length - 1 ? "r:0|0|5|5" : ""
                    } f:14 m:3 r:5 w:full bg:#e0e0e0:hover`}
                  style={`${optionStyle} ${selected().some(
                    (item: { value: any }) =>
                      getOptionValue(item) === getOptionValue(option),
                  )
                    ? optionSelectedStyle
                    : ""
                    }`}
                  onMouseDown={() => handleSelectChange(getOptionValue(option))}
                >
                  {props.renderLabel
                    ? props.renderLabel(option)
                    : getOptionLabel(option)}
                </div>
              )}
            </For>
          </Show>
        </div>
      </Portal>
    )
  }

  return (
    <div ref={setReference} style={containerStyle} class="grid text-align:left">
      <div style={inputContainerStyle}>
        <For each={selected()}>
          {(tag) => (
            <div style={tagStyle} class="f:14">
              {props.renderLabel ? props.renderLabel(tag) : getOptionLabel(tag)}
              <span
                style={closeButtonStyle}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return handleRemoveTag(getOptionValue(tag));
                }}
              >
                <Icon icon="ic:round-close" height={21} width={21} />
              </span>
            </div>
          )}
        </For>
        <input
          ref={inputRef}
          type="text"
          style={inputStyle()}
          value={inputValue()}
          onInput={(e) => setInputValue(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={props.placeholder ?? "Select options"}
          disabled={props.disable}
        />
      </div>
      <Show when={dropdownVisible()}>
        <Options />
      </Show>
    </div>
  );
}
