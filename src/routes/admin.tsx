import {createAsync, redirect, RouteSectionProps, useNavigate} from "@solidjs/router";
import {EdgeMap, GraphContext, GraphInterface, Id, VertexMap} from "~/lib/graph";
import {CSSRuntimeProvider} from "~/components/css/CSSRuntimeProvider";
import {ServerEventsDispatcher, WS_PATH, WsContext} from "~/utils/ws_events_dispatcher";
import {createStore} from "solid-js/store";
import {config} from "~/master.css";
import {FullDashboard} from "~/pages/Dashboard";
import {API, DataFetcher} from "~/components/DataFetcher";
import {getUser} from "~/pages/auth/auth";
import {APP_BASE_URL} from "~/lib/Utils";
import {createEffect} from "solid-js";

export default function UsersLayout(props: RouteSectionProps) {
    const Ws = new ServerEventsDispatcher(WS_PATH);
    const navigate = useNavigate();
    const graph = createStore<GraphInterface>({
        _isPartialSynced: false,
        vertexes: {} as VertexMap,
        edges: {} as EdgeMap,
        vertexLabelIdMap: {} as { [key: string]: Id[] },
        initialSynced: false, // TODO: Display initialSynced status to the UI
        lastSyncedTime: 0,
        member: {},
    });
    getUser().then(value =>
    {
        console.log(value)
        if (value?.error) {
            navigate(`/auth/login`)
        }
    });


    return (
            <CSSRuntimeProvider config={config}>
        <GraphContext.Provider value={graph}>
                <WsContext.Provider value={{ Ws }}>
                    {/* In DataFetch fetch only side bar data*/}
                    <DataFetcher fetchData={API.fetchDataUrl} renderContent={<FullDashboard children={props.children}/>}/>
                    {/*{props.children}*/}
                </WsContext.Provider>
        </GraphContext.Provider>
            </CSSRuntimeProvider>
    );
}
