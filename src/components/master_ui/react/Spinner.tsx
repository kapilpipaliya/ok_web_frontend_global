import type { JSX } from "solid-js"

const Spinner = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
    return (
        <svg {...props} fill="none" height="1em" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path class="@fade|1s|ease-out|reverse|infinite|-.875s" d="M7.75 7.75l-2.15 -2.15"></path>
            <path class="@fade|1s|ease-out|reverse|infinite|-.75s" d="M12 6l0 -3"></path>
            <path class="@fade|1s|ease-out|reverse|infinite|-.625s" d="M16.25 7.75l2.15 -2.15"></path>
            <path class="@fade|1s|ease-out|reverse|infinite|-.5s" d="M18 12l3 0"></path>
            <path class="@fade|1s|ease-out|reverse|infinite|-.375s" d="M16.25 16.25l2.15 2.15"></path>
            <path class="@fade|1s|ease-out|reverse|infinite|-.25s" d="M12 18l0 3"></path>
            <path class="@fade|1s|ease-out|reverse|infinite|-.125s" d="M7.75 16.25l-2.15 2.15"></path>
            <path class="@fade|1s|ease-out|reverse|infinite" d="M6 12l-3 0"></path>
        </svg>
    )
}

export default Spinner