import clsx from 'clsx'
import { type JSX, splitProps } from 'solid-js'

import type { segmentsSizes } from '../core/segments'

type SegmentsProps = {
    size?: ({} & string) | (keyof typeof segmentsSizes)
} & JSX.HTMLAttributes<HTMLDivElement>

const Segments = (props: SegmentsProps) => {
    const [local, others] = splitProps(props, ['class', 'size']);
    return <div {...others} class={clsx('segments', local.size && `segments-${local.size ?? "md"}`, props.class)} />
}

export default Segments