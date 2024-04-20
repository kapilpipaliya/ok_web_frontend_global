import {MetaProvider} from "@solidjs/meta";
import {A, Route, Router, useMatch, useParams} from "@solidjs/router";
import {FileRoutes} from "@solidjs/start/router";
import {Component, Show, Suspense} from "solid-js";

export default function App() {
    return (
        <Router
            root={props => {
                return <MetaProvider>
                    <div id="popup-root" />
                    <Suspense>
                        {props.children}
                    </Suspense>
                </MetaProvider>
            }}
        >
        <FileRoutes/>
        </Router>
    )
}
