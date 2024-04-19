import type {RouteSectionProps} from "@solidjs/router";
import {EdgeMap, GraphContext, GraphInterface, Id, VertexMap} from "~/lib/graph";
import {CSSRuntimeProvider} from "~/components/css/CSSRuntimeProvider";
import {ServerEventsDispatcher, WS_PATH, WsContext} from "~/utils/ws_events_dispatcher";
import {createStore} from "solid-js/store";
import {Show} from "solid-js";
import {LoaderNew} from "~/components/LoaderSimple";
import {config} from "~/master.css";
import Counter from "~/components/Counter";
import {FullDashboard} from "~/pages/Dashboard";

export default function UsersLayout(props: RouteSectionProps) {
    const Ws = new ServerEventsDispatcher(WS_PATH);
    const graph = createStore<GraphInterface>({
        _isPartialSynced: false,
        vertexes: {} as VertexMap,
        edges: {} as EdgeMap,
        vertexLabelIdMap: {} as { [key: string]: Id[] },
        initialSynced: false, // TODO: Display initialSynced status to the UI
        lastSyncedTime: 0,
        member: {},
    });

    return (
        <GraphContext.Provider value={graph}>
            <CSSRuntimeProvider config={config}>
                <WsContext.Provider value={{ Ws }}>
                    <Counter />
                    {props.children}
                </WsContext.Provider>
            </CSSRuntimeProvider>
        </GraphContext.Provider>
    );
}
