import { createSignal } from 'solid-js';

const StatusChip = (props: { status: string }) => {
    const [status] = createSignal(props.status);

    const getStatusStyles = () => {
        switch (status()) {
            case 'pending':
                return 'color: orange; background-color: white;border: 1px solid orange; ';
            case 'completed':
                return 'color: rgba(1, 130, 1); background-color: white;border: 1px solid rgba(1, 130, 1); ';
            case 'cancelled':
                return 'color: red; background-color: white;border: 1px solid red; ';
            default:
                return 'color: gray; background-color: white;border: 1px solid gray; ';
        }
    };

    return (
        <span style={`display: inline-block; padding: 4px 8px; border-radius: 5px; font-size: 14px; font-weight: bold; text-transform: uppercase; ${getStatusStyles()}`}>
            {status()}
        </span>
    );
};

export default StatusChip;
