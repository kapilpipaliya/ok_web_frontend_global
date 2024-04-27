import {MetaProvider} from "@solidjs/meta";
import {A, Route, Router, useMatch, useParams} from "@solidjs/router";
import {FileRoutes} from "@solidjs/start/router";
import {Component, createSignal, Show, Suspense} from "solid-js";
import {Toaster} from "solid-toast";
import {LoaderNew} from "~/components/LoaderSimple";
import {config} from "~/master.css";
import {CSSRuntimeProvider} from "~/components/css/CSSRuntimeProvider";
import {LoadingContext} from "~/globals/global";

export default function App() {
    const loadingSite = createSignal(false);
    return (
        <CSSRuntimeProvider config={config}>
            <LoadingContext.Provider value={loadingSite}>
                <Router
                    root={props => {
                        return <MetaProvider>
                            <div id="popup-root"/>
                            <Suspense>
                                <Show when={!loadingSite[0]()} fallback={<LoaderNew/>}>
                                  FDSA  {props.children}
                                </Show>
                            </Suspense>
                            <Toaster/>

                        </MetaProvider>
                    }}
                >
                    <FileRoutes/>
                </Router>
            </LoadingContext.Provider>
        </CSSRuntimeProvider>
    )
}
