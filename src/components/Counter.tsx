import {createSignal, For} from "solid-js";
import {css} from "solid-styled";
import {A} from "@solidjs/router";

export default function Counter() {
    const [count, setCount] = createSignal(0);
    css`
        button {
            font-family: inherit;
            font-size: inherit;
            padding: 1em 2em;
            color: #335d92;
            background-color: rgba(${String(count() * 30)}, 107, 158, 0.1);
            border-radius: 2em;
            border: 2px solid rgba(68, 107, 158, 0);
            outline: none;
            width: 200px;
            font-variant-numeric: tabular-nums;
        }

        button:focus {
            border: 2px solid #335d92;
        }
    `;

    return <div class="flex gap:10">

        <For each={[
            {text: 'Home', href: '/'},
            {text: 'Admin', href: '/admin'},
            {text: '/admin/Components/2215', href: '/admin/Page/2215'},
            {text: '/admin/Page', href: '/admin/Page'},
            {text: '/login', href: '/auth/login'},
            {text: '/signup', href: '/auth/signup'},
            {text: '/admin/forms', href: '/admin/forms'},
            {text: '/admin/Graph', href: '/admin/Graph'},
            {text: '/admin/dashboards', href: '/admin/dashboards'},
            {text: '/admin/backup_restore', href: '/admin/backup_restore'},
            {text: '/admin/Nav/new', href: '/admin/Nav/new'},
            {text: '/admin/grid/:name', href: '/admin/grid/asd'},
            {text: '/admin/SimpleImport', href: '/admin/SimpleImport'},
        ]}>

            {(link, index) => (
                <div class={'text:underline'}><A key={index} href={link.href}>{link.text}</A></div>
            )}
        </For>
    </div>

}
