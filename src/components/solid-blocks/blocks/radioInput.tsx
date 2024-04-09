import {createSignal, JSX} from 'solid-js';
import './radioInput.css'; // Import your CSS file

const RadioInputs = (props: {
    options: any,
    onChange: (value: any) => void,
    value: any,
    defaultCheckedIndex?: number,
    radioInputStyle?:  JSX.CSSProperties ,
    radioStyle?:  JSX.CSSProperties ,
    inputStyle?:  JSX.CSSProperties ,
    nameStyle?:  JSX.CSSProperties
}) => {

    const [selectedOption, setSelectedOption] = createSignal(props.defaultCheckedIndex ?? 1);

    const handleChange = (index) => {
        setSelectedOption(index);
        const selectedValue = props.options[index].value;
        props.onChange(selectedValue);
    };

    return (
        <div class={`radio-inputs`} style={props.radioInputStyle}>
            {props.options.map((option, index) => (
                <label class={`radio`} style={props.radioStyle} key={index}>
                    <input
                        type="radio"
                        name={option}
                        style={props.inputStyle}
                        checked={option.value === option.value}
                        onChange={() => handleChange(index)}
                    />
                    <span class={`name`} style={props.nameStyle}>{option.key}</span>
                </label>
            ))}
        </div>
    );
};

export default RadioInputs;
