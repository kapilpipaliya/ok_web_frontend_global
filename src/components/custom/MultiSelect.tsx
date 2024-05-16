import {
  Component,
  createEffect,
  createSignal,
  For,
  JSX,
  mergeProps,
  onMount,
  Show,
  splitProps,
} from "solid-js";
import "~/css/MultiSelect.css";
// import { isArray, isInteger, isObject } from 'lodash';

// const DownArrow = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Angle_down_font_awesome.svg/1200px-Angle_down_font_awesome.svg.png';
const DownArrow =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Angle_down_font_awesome.svg/1200px-Angle_down_font_awesome.svg.png";
type Option =
  | Record<string, string | number | boolean | unknown>
  | string
  | number;
const defaultProps = {
  emptyRecordMsg: "No records found",
  options: [],
  selectedValues: [],
  showArrow: false,
  singleSelect: false,
  style: {},
  placeholder: "select",
  groupBy: "",
  disable: false,
  onSelect: () => {},
  onRemove: () => {},
};

export interface IMultiSelectProps {
  options: Option[];
  disablePreSelectedValues?: boolean;
  selectedValues?: Option[];
  isObject?: boolean;
  displayValue?: string;
  displayValueChild?: string;
  displayValueParent?: string;
  showCheckbox?: boolean;
  selectionLimit?: number;
  placeholder?: string;
  groupBy?: string;
  style?: object;
  emptyRecordMsg?: string;
  onSelect?: (selectedList: Option[], selectedItem: Option) => void;
  onRemove?: (selectedList: Option[], selectedItem: Option) => void;
  onSearch?: (value: string) => void;
  closeIcon?: string;
  singleSelect?: boolean;
  caseSensitiveSearch?: boolean;
  id?: string;
  closeOnSelect?: boolean;
  avoidHighlightFirstOption?: boolean;
  hidePlaceholder?: boolean;
  showArrow?: boolean;
  keepSearchTerm?: boolean;
  disable?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  customCloseIcon?: JSX.Element | string;
}

const closeIconTypes = {
  circle: DownArrow, // CloseCircleDark,
  circle2: DownArrow, // CloseCircle
  // close: CloseSquare,
  // cancel: CloseLine
};

export const MultiSelect: Component<IMultiSelectProps> = (
  props: IMultiSelectProps,
) => {
  props = mergeProps(defaultProps, props);
  const [local] = splitProps(props, [
    "placeholder",
    "style",
    "singleSelect",
    "id",
    "hidePlaceholder",
    "disable",
    "showArrow",
    "avoidHighlightFirstOption",
  ]);
  const {
    placeholder,
    style,
    singleSelect,
    id,
    hidePlaceholder,
    disable,
    showArrow,
    avoidHighlightFirstOption,
  } = local;

  const [toggleOptionsList, setToggleOptionsList] = createSignal(false);
  const [highlightOption, setHighlightOption] = createSignal(
    avoidHighlightFirstOption ? -1 : 0,
  );
  const [inputValue, setInputValue] = createSignal("");
  const [options, setOptions] = createSignal<Option[]>(props.options);
  const [filteredOptions, setFilteredOptions] = createSignal(props.options);
  const [unfilteredOptions, setUnfilteredOptions] = createSignal(props.options);
  const [selectedValues, setSelectedValues] = createSignal<Option[]>(
    Object.assign([], props.selectedValues),
  );
  const [preSelectedValues, setPreSelectedValues] = createSignal(
    Object.assign([], props.selectedValues),
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [keepSearchTerm, setKeepSearchTerm] = createSignal(
    props.keepSearchTerm,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [closeIconType, setCloseIconType] = createSignal(
    closeIconTypes[props.closeIcon] || closeIconTypes["circle"],
  );
  const [groupedObject, setGroupedObject] = createSignal([]);

  let optionTimeout: number;
  let searchBox: HTMLInputElement;
  const searchWrapper = (el: HTMLDivElement) =>
    el.addEventListener("click", listenerCallback);

  function renderGroupByOptions() {
    const isObject = props.isObject || false;
    const displayValue = props.displayValue;
    const displayValueParent = props.displayValueParent;
    const displayValueChild = props.displayValueChild;
    const showCheckbox = props.showCheckbox;
    const style = props.style;
    const singleSelect = props.singleSelect;
    const groupedObjectKeys = Object.keys(groupedObject());

    return (
      <For each={groupedObjectKeys}>
        {(objKey) => (
          <>
            <li class="groupHeading" style={style["groupHeading"]}>
              {objKey}
            </li>
            <For each={groupedObject()[objKey]}>
              {(option: Option) => {
                return (
                  <li
                    style={style["option"]}
                    class="groupChildEle option"
                    classList={{
                      disableSelection:
                        fadeOutSelection(option) ||
                        isDisablePreSelectedValues(option),
                    }}
                    onClick={onSelectItem(option)}
                  >
                    <Show when={showCheckbox && !singleSelect}>
                      <input
                        type="checkbox"
                        class="checkbox"
                        readOnly
                        checked={isSelectedValue(option)}
                      />
                    </Show>

                    {isObject
                      ? option[displayValue]
                      : (option || "").toString()}
                  </li>
                );
              }}
            </For>
          </>
        )}
      </For>
    );
  }

  const isSelectedValue = (item: Option) => {
    if (props.isObject) {
      return (
        selectedValues().filter(
          (i: Option) =>
            i[props.displayValueParent][props.displayValueChild] ===
            item[props.displayValueParent][props.displayValueChild],
        ).length > 0
      );
    }
    return selectedValues().filter((i) => i === item).length > 0;
  };

  const fadeOutSelection = (item: Option) => {
    if (props.singleSelect) {
      return;
    }
    if (props.selectionLimit == -1) {
      return false;
    }
    if (props.selectionLimit != selectedValues().length) {
      return false;
    }
    if (props.selectionLimit == selectedValues().length) {
      if (!props.showCheckbox) {
        return true;
      } else {
        if (isSelectedValue(item)) {
          return false;
        }
        return true;
      }
    }
  };

  const isDisablePreSelectedValues = (value: Option) => {
    if (!props.disablePreSelectedValues || !preSelectedValues().length) {
      return false;
    }
    if (props.isObject) {
      return (
        preSelectedValues().filter(
          (i) =>
            i[props.displayValueParent][props.displayValueChild] ===
            value[props.displayValueParent][props.displayValueChild],
        ).length > 0
      );
    }
    return preSelectedValues().filter((i) => i === value).length > 0;
  };

  const removeSelectedValuesFromOptions = (skipCheck: boolean) => {
    if (!skipCheck && props.groupBy) {
      groupByOptions(options());
    }
    if (!selectedValues().length && !skipCheck) {
      return;
    }
    if (props.isObject) {
      const optionList = unfilteredOptions().filter((item) => {
        return selectedValues().findIndex(
          (v) =>
            v[props.displayValueParent][props.displayValueChild] ===
            item[props.displayValueParent][props.displayValueChild],
        ) === -1
          ? true
          : false;
      });
      if (props.groupBy) {
        groupByOptions(optionList);
      }
      setOptions(optionList);
      setFilteredOptions(optionList);
      // TODO: Fix wait
      setTimeout(() => {
        filterOptionsByInput();
      }, 0);
      return;
    }
    const optionList = unfilteredOptions().filter(
      (item) => selectedValues().indexOf(item) === -1,
    );

    setOptions(optionList);
    setFilteredOptions(optionList);
    // TODO: Fix wait
    setTimeout(() => {
      filterOptionsByInput();
    }, 0);
  };

  const initialSetValue = () => {
    if (!props.showCheckbox && !props.singleSelect) {
      removeSelectedValuesFromOptions(false);
    }

    if (props.groupBy) {
      groupByOptions(options());
    }
  };

  createEffect((prevOptions) => {
    if (JSON.stringify(prevOptions) !== JSON.stringify(props.options)) {
      setOptions(props.options);
      setFilteredOptions(props.options);
      setUnfilteredOptions(props.options);
      // TODO: Fix wait
      setTimeout(() => {
        initialSetValue();
      }, 0);
    }
    return props.options;
  }, props.options);

  createEffect((prevSelectedValues) => {
    if (
      JSON.stringify(prevSelectedValues) !==
      JSON.stringify(props.selectedValues)
    ) {
      setSelectedValues(Object.assign([], props.selectedValues));
      setPreSelectedValues(Object.assign([], props.selectedValues));
      // TODO: Fix wait
      setTimeout(() => {
        initialSetValue();
      }, 0);
    }
    return props.selectedValues;
  }, props.selectedValues);

  onMount(() => {
    initialSetValue();
  });

  const onSingleSelect = (item: Option) => {
    setSelectedValues([item]);
    setToggleOptionsList(false);
  };

  const onRemoveSelectedItem = (item: Option) => {
    let index = 0;
    const newSelectedValues = [...selectedValues()];

    if (props.isObject) {
      index = newSelectedValues.findIndex(
        (i) =>
          i[props.displayValueParent][props.displayValueChild] ===
          item[props.displayValueParent][props.displayValueChild],
      );
    } else {
      index = newSelectedValues.indexOf(item);
    }
    props.onRemove(newSelectedValues, item);
    newSelectedValues.splice(index, 1);
    setSelectedValues(newSelectedValues);
    if (!props.showCheckbox) {
      removeSelectedValuesFromOptions(true);
    }
    if (!props.closeOnSelect) {
      searchBox.focus();
    }
  };

  const onSelectItem = (item: Option) => () => {
    if (!keepSearchTerm) {
      setInputValue("");
    }
    if (singleSelect) {
      onSingleSelect(item);
      props.onSelect([item], item);
      setInputValue("");
      return;
    }
    if (isSelectedValue(item)) {
      onRemoveSelectedItem(item);
      return;
    }
    if (props.selectionLimit == selectedValues().length) {
      return;
    }

    const newValuesSelected: Option[] = [...selectedValues(), item];

    props.onSelect(newValuesSelected, item);

    setSelectedValues(newValuesSelected);

    if (!props.showCheckbox) {
      removeSelectedValuesFromOptions(true);
    } else {
      filterOptionsByInput();
    }

    if (!props.closeOnSelect) {
      searchBox.focus();
    }
  };

  function renderNormalOption() {
    return (
      <For
        each={options()}
        fallback={
          <span style={props.style["notFound"]} class="notFound">
            {props.emptyRecordMsg ?? "No Options Available"}
          </span>
        }
      >
        {(option, index) => (
          <li
            style={props.style["option"]}
            class="option"
            classList={{
              disableSelection: fadeOutSelection(option),
              "highlightOption highlight": highlightOption() === index(),
            }}
            onClick={onSelectItem(option)}
          >
            <Show when={props.showCheckbox && !props.singleSelect}>
              <input
                type="checkbox"
                readOnly
                class="checkbox"
                checked={isSelectedValue(option)}
              />
            </Show>
            <Show
              when={props.isObject}
              fallback={() => (option || "").toString()}
            >
              {option[props.displayValueParent]?.[props.displayValueChild]}
            </Show>
          </li>
        )}
      </For>
    );
  }

  function renderOptionList() {
    const loadingMessage = props.loadingMessage ?? "loading...";
    if (props.loading) {
      return (
        <ul class="optionContainer" style={props.style["optionContainer"]}>
          <Show
            when={typeof loadingMessage === "string"}
            fallback={loadingMessage}
          >
            <span class="notFound" style={props.style["loadingMessage"]}>
              {loadingMessage}
            </span>
          </Show>
        </ul>
      );
    }
    return (
      <ul class="optionContainer" style={props.style["optionContainer"]}>
        {!props.groupBy ? renderNormalOption() : renderGroupByOptions()}
      </ul>
    );
  }

  const listenerCallback = () => {
    searchBox.focus();
  };

  const toggleOptionList = () => {
    setToggleOptionsList(!toggleOptionsList());
    setHighlightOption(avoidHighlightFirstOption ? -1 : 0);
  };

  const matchValues = (value: string, search: string) => {
    if (!value) {
      return false; // Return false if value is undefined or null
    }
    if (props.caseSensitiveSearch) {
      return value.indexOf(search) > -1;
    }
    if (typeof value.toLowerCase === "function") {
      return value.toLowerCase().indexOf(search.toLowerCase()) > -1;
    }
    return value.toString().indexOf(search) > -1;
  };

  const filterOptionsByInput = () => {
    let newOptions: Option[];
    if (props.isObject) {
      newOptions = filteredOptions().filter((option) =>
        matchValues(
          option[props.displayValueParent][props.displayValueChild],
          inputValue(),
        ),
      );
    } else {
      newOptions = filteredOptions().filter((option) =>
        matchValues(
          option[props.displayValueParent][props.displayValueChild].toString(),
          inputValue(),
        ),
      );
    }
    groupByOptions(newOptions);
    setOptions(newOptions);
  };

  const groupByOptions = (options: Option[]) => {
    const groupBy = props.groupBy;
    const groupedObject = options.reduce(function (r, a) {
      const key = a[groupBy] || "Others";
      r[key] = r[key] || [];
      r[key].push(a);
      return r;
    }, Object.create({}));

    setGroupedObject(groupedObject);
  };

  const onInput = (event) => {
    if (singleSelect) {
      setSelectedValues([]);
    }

    setInputValue(event.target.value);
    // TODO: Fix wait setInputValue
    setTimeout(() => {
      filterOptionsByInput();
    }, 0);
    if (props.onSearch) {
      props.onSearch(event.target.value);
    }
  };

  const onFocus = () => {
    if (singleSelect) {
      setOptions(props.options);
    }
    if (toggleOptionsList()) {
      clearTimeout(optionTimeout);
    } else {
      toggleOptionList();
    }
  };

  const onBlur = () => {
    if (toggleOptionsList()) {
      optionTimeout = setTimeout(() => setToggleOptionsList(false), 150);
      if (singleSelect) {
        setInputValue("");
      }
    }
  };

  const onArrowKeyNavigation = (e) => {
    if (
      e.keyCode === 8 &&
      !inputValue() &&
      !props.disablePreSelectedValues &&
      selectedValues().length
    ) {
      onRemoveSelectedItem(selectedValues().length - 1);
    }
    if (!options().length) {
      return;
    }
    if (e.keyCode === 38) {
      if (highlightOption() > 0) {
        setHighlightOption((previousState) => previousState - 1);
      } else {
        setHighlightOption(options().length - 1);
      }
    } else if (e.keyCode === 40) {
      if (highlightOption() < options().length - 1) {
        setHighlightOption((previousState) => previousState + 1);
      } else {
        setHighlightOption(0);
      }
    } else if (e.key === "Enter" && options().length && toggleOptionsList()) {
      if (highlightOption() === -1) {
        return;
      }
      onSelectItem(options()[highlightOption()])();
    }
  };

  function renderSelectedList() {
    return (
      <For each={selectedValues()}>
        {(value) => {
          return (
            <span
              class="chip"
              classList={{
                disableSelection: isDisablePreSelectedValues(value),
              }}
              style={props.style["chips"]}
            >
              {!props.isObject
                ? (value || "").toString()
                : value[props.displayValueParent][props.displayValueChild]}
              <Show when={!isDisablePreSelectedValues(value)}>
                <Show
                  when={!props.customCloseIcon}
                  fallback={
                    <i
                      class="custom-close"
                      onClick={() => {
                        //   if (selectedValues().length === 1) {
                        //     setSelectedValues([]);
                        //   } else {
                        onRemoveSelectedItem(value);
                        //   }
                      }}
                      style={{
                        "margin-left": ".3rem",
                        cursor: "pointer",
                      }}
                    >
                      {props.customCloseIcon}
                    </i>
                  }
                >
                  <img
                    class="icon_cancel closeIcon"
                    src={closeIconType()}
                    onClick={() => onRemoveSelectedItem(value)}
                  />
                </Show>
              </Show>
            </span>
          );
        }}
      </For>
    );
  }

  function renderMultiSelectContainer() {
    return (
      <div
        class="multiSelect-container multiSelectContainer"
        classList={{ disable_ms: disable }}
        id={id || "multiSelectContainerSolid"}
        style={(style["multiSelectContainer"], { "background-color": "white" })}
      >
        <div
          class="search-wrapper searchWrapper"
          classList={{ singleSelect }}
          ref={searchWrapper}
          style={style["searchBox"]}
        >
          {renderSelectedList()}
          <input
            type="text"
            ref={searchBox}
            placeholder={placeholder}
            class="searchBox"
            classList={{ searchSingle: singleSelect }}
            id={`${id || "search"}_input`}
            onInput={onInput}
            value={inputValue()}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onArrowKeyNavigation}
            style={style["inputField"]}
            autocomplete="off"
            disabled={disable}
          />
          <Show when={showArrow}>
            <img class="icon_cancel icon_down_dir" src={DownArrow} />
          </Show>
        </div>
        <div
          class="optionListContainer"
          classList={{
            displayBlock: toggleOptionsList(),
            displayNone: !toggleOptionsList(),
          }}
        >
          {renderOptionList()}
        </div>
      </div>
    );
  }

  return renderMultiSelectContainer();
};

export default MultiSelect;
