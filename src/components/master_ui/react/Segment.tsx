import clsx from 'clsx';
import { type Component, type JSX, splitProps } from 'solid-js';

type SegmentProps = {
    active?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const Segment: Component<SegmentProps> = (props) => {
    const [local, others] = splitProps(props, ['class', 'active']);
    return <button {...others} class={clsx('segment', local.class, props.active && 'active')} />
}

export default Segment;
