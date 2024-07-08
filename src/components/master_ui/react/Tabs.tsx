import clsx from 'clsx';
import { type JSX, splitProps } from 'solid-js';

type TabsProps = {
    underlined?: boolean
} & JSX.HTMLAttributes<HTMLDivElement>;

const Tabs = (props: TabsProps) => {
    const [local, others] = splitProps(props, ['class', 'underlined']);
    return <div {...others} class={clsx(
        'tabs',
        local.underlined && 'tabs-underlined',
        local.class
    )} />
}

export default Tabs