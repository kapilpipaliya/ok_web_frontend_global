import { Icon } from "@iconify-icon/solid";
import { JSX, createSignal, For } from "solid-js";

const MultiSelect = (props: { selectedValues: any; options: any[]; onRemove: (arg0: any, arg1: any) => void; onSelect: (arg0: any, arg1: any) => void; placeholder: string | undefined; disable: boolean | undefined; renderLabel: ((arg0: any) => JSX.Element) | undefined; }) => {
    const defaultProps = {
        options: [],
        selectedValues: [],
        onSelect: () => { },
        onRemove: () => { },
        placeholder: "Select options",
        disable: false,
        renderLabel: null,

    };

    // Merge props with default properties
    props = { ...defaultProps, ...props };

    // Define signals for managing state
    const [selected, setSelected] = createSignal(props.selectedValues);
    const [inputValue, setInputValue] = createSignal("");
    const [dropdownVisible, setDropdownVisible] = createSignal(false);

    // Helper function to get value and label
    const getOptionValue = (option: { value: any; }) => (typeof option === 'object' ? option.value : option);
    const getOptionLabel = (option: { label: any; }) => (typeof option === 'object' ? option.label : option);

    // Handle changes in selection
    const handleSelectChange = (value: any) => {
        let newSelected;
        if (selected().some((item: any) => getOptionValue(item) === value)) {
            newSelected = selected().filter((item: any) => getOptionValue(item) !== value);
        } else {
            const selectedOption = props.options.find((option: any) => getOptionValue(option) === value);
            newSelected = [...selected(), selectedOption];
        }
        setSelected(newSelected);
        if (selected().some((item: any) => getOptionValue(item) === value)) {
            props.onRemove(newSelected, value);
        } else {
            props.onSelect(newSelected, value);
        }
    };

    // Remove tag from selected values
    const handleRemoveTag = (value: any) => {
        const newSelected = selected().filter((item: any) => getOptionValue(item) !== value);
        setSelected(newSelected);
        props.onRemove(newSelected, value);
    };

    // Inline styles
    const containerStyle = "position: relative; display: inline-block; width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px; background: white;";
    const inputContainerStyle = "display: flex; flex-wrap: wrap; align-items: center; gap: 5px; width: 100%;";
    const tagStyle = "background: #3377cc;color: #fff; padding: 5px 10px; border-radius: 4px; display: flex; align-items: center; gap: 5px; cursor: default;";
    const closeButtonStyle = "cursor: pointer; display: flex;";
    const inputStyle = "flex: 1; min-width: 100px; padding: 5px; border: none; outline: none;";
    const dropdownStyle: any = () => ({
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '100%',
        border: '1px solid #ccc',
        background: 'white',
        maxHeight: '200px',
        overflowY: 'auto',
        zIndex: 1000,
        display: dropdownVisible() ? 'block' : 'none',
    });
    const optionStyle = "padding: 8px; cursor: pointer;";
    const optionSelectedStyle = "background: #ddd;";

    // Handle input focus to show dropdown
    const handleInputFocus = () => {
        setDropdownVisible(true);
    };

    // Handle input blur to hide dropdown
    const handleInputBlur = () => {
        setTimeout(() => setDropdownVisible(false), 100); // Delay to allow click event on options
    };

    // Filter options based on input value
    const filteredOptions = () =>
        props.options.filter((option: any) =>
            getOptionLabel(option).toLowerCase().includes(inputValue().toLowerCase())
        );

    return (
        <div style={containerStyle}>
            <div style={inputContainerStyle}>
                <For each={selected()}>
                    {(tag) => (
                        <div style={tagStyle} class='f:14'>
                            {props.renderLabel ? props.renderLabel(tag) : getOptionLabel(tag)}
                            <span style={closeButtonStyle} onClick={() => handleRemoveTag(getOptionValue(tag))}>
                                <Icon icon="lets-icons:close-round" height={21} width={21} />
                            </span>
                        </div>
                    )}
                </For>
                <input
                    type="text"
                    class='f:14'
                    style={inputStyle}
                    value={inputValue()}
                    onInput={(e) => setInputValue(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={props.placeholder}
                    disabled={props.disable}
                />
            </div>
            <div style={dropdownStyle()} class="r:0|0|10|10">
                <For each={filteredOptions()}>
                    {(option, index) => (
                        <div
                            class={`${index() == filteredOptions().length - 1 ? "r:0|0|10|10" : ""} f:15`}
                            style={`${optionStyle} ${selected().some((item: { value: any; }) => getOptionValue(item) === getOptionValue(option)) ? optionSelectedStyle : ""}`}
                            onMouseDown={() => handleSelectChange(getOptionValue(option))}
                        >
                            {props.renderLabel ? props.renderLabel(option) : getOptionLabel(option)}
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
};

export default MultiSelect;