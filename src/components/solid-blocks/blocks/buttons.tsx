import { createSignal } from 'solid-js';

const CustomButton = (props) => {
    const [variant, setVariant] = createSignal(props.variant || 'contained');

    // Define base styles
    const baseStyles = {
        padding: '0.3rem 1rem',
        "border-radius": '0.3rem',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        margin: '1px',
        "text-decoration": 'none',
        display: 'inline-block',
        textAlign: 'center',
        transition: 'background-color 0.3s, color 0.3s',
    };

    // Define styles for different variants
    const variants = {
        outlined: {
            ...baseStyles,
            color: '#37c',
            "background-color": 'transparent',
            border: '1.5px solid #37c',
        },
        contained: {
            ...baseStyles,
            color: 'white',
            "background-color": '#37c',
        },
        custom: {
            ...baseStyles,
            ...(props.style || {}), // Merge with user-defined styles
        },
    };


    // Get styles based on the variant
    const buttonStyles = {
        ...variants[variant()],
        ...(props.class ? { class: props.class } : {}),
    };

    return (
        <button
            style={buttonStyles}
            {...props}
        >
            {props.children}
        </button>
    );
};

export default CustomButton;
