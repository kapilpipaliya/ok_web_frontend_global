import {children, createEffect, createResource, JSX, Match, Show, Switch, useContext} from "solid-js";
import {GraphContext} from "~/lib/graph";
import {setGraphData} from "~/lib/ws_events";
import {LoaderNew} from "~/components/LoaderSimple";
import {API_BASE_URL} from "~/lib/api";

export const DataFetcher = (props: { fetchData: string, renderContent: JSX.Element, errorMessage?: string }) => {
    const [graph, setGraph] = useContext(GraphContext)!;
    const [WsData, {refetch}] = createResource(async () => {
        try {
            const response = await fetch(props.fetchData);
            const data = await response.json();
            setGraphData(graph, setGraph, data);
            return data;
        } catch (error) {
            throw error;
        }
    });

    createEffect(() => {
        if (WsData() === undefined) {
            refetch();
        } else {
            setGraphData(graph, setGraph, WsData());
        }
    });

    return (
        <Switch>
            <Match when={WsData.error}>
                <div>Error: {props.errorMessage ?? WsData.error}</div>
            </Match>
            <Match when={WsData.loading}>
                <LoaderNew/>
            </Match>
            <Match when={true}>
                <Show when={graph.initialSynced}>
                    {props.renderContent}
                </Show>
            </Match>
        </Switch>
    );
}

export const API = {
    fetchDataUrl: `${API_BASE_URL}/get_data`,
    loginUrl: `${API_BASE_URL}/login`,
    signUpUrl: `${API_BASE_URL}/signup`,
    profileUrl: `${API_BASE_URL}/profile`,
    logOutUrl: `${API_BASE_URL}/logout`,
};
