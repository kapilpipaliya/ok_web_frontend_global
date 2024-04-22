import type {RouteSectionProps} from "@solidjs/router";
import {CSSRuntimeProvider} from "~/components/css/CSSRuntimeProvider";
import {config} from "~/master.css";


export default function auth(props: RouteSectionProps) {
    return (
        <CSSRuntimeProvider config={config}>
            {props.children}
        </CSSRuntimeProvider>
    );
}
