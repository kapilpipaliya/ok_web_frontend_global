import clsx from 'clsx'
import { type JSX, splitProps } from 'solid-js'

const SelectIndicator = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
    const [local, others] = splitProps(props, ['class'])
    return (
        <svg {...others} class={clsx('select-indicator right:.5em', local.class)} fill="none" height="1.25em" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" viewBox="0 0 24 24" width="1.25em" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" stroke="none" />
            <path d="M8 9l4 -4l4 4" /><path d="M16 15l-4 4l-4 -4" />
        </svg>
    )
}

export default SelectIndicator
