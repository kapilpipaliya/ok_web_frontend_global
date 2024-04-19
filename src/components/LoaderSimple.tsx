import '../components/css/modal.css';

export function LoaderSimple(props: { class?: string }) {
    return (
        <div class={props.class}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <title>Loader</title>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path class="@fade|1s|ease-out|reverse|infinite|0s" d="M7.75 7.75l-2.15 -2.15"/>
                <path class="@fade|1s|ease-out|reverse|infinite|.125s" d="M12 6l0 -3"/>
                <path class="@fade|1s|ease-out|reverse|infinite|.25s" d="M16.25 7.75l2.15 -2.15"/>
                <path class="@fade|1s|ease-out|reverse|infinite|.375s" d="M18 12l3 0"/>
                <path class="@fade|1s|ease-out|reverse|infinite|.5s" d="M16.25 16.25l2.15 2.15"/>
                <path class="@fade|1s|ease-out|reverse|infinite|.625s" d="M12 18l0 3"/>
                <path class="@fade|1s|ease-out|reverse|infinite|.75s" d="M7.75 16.25l-2.15 2.15"/>
                <path class="@fade|1s|ease-out|reverse|infinite|.875s" d="M6 12l-3 0"/>
            </svg>
        </div>
    );
}

export function LoaderNew(props: { class?: string }) {
    return (
        <div style={'height:100vh;place-content:center;display:grid;'}>
            <div class={`${props.class} loader`}/>
        </div>
    );
}
