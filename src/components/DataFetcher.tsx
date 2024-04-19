import {JSX, Match, Show, Switch, useContext, createResource} from "solid-js";
import {GraphContext} from "~/lib/graph";
import {setGraphData} from "~/lib/ws_events";
import {LoaderNew} from "~/components/LoaderSimple";

export const DataFetcher = (props: { fetchData: string, renderContent: JSX.Element, errorMessage?: string }) => {
    const [graph, setGraph] = useContext(GraphContext)!;
    const [WsData] = createResource(async () => {
        try {
            const response = await fetch(props.fetchData);
            const data = await response.json();
            setGraphData(graph, setGraph, data);
            return data;
        } catch (error) {
            throw error;
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
                <Show when={graph.initialSynced} fallback={<div>{JSON.stringify(graph)}</div>}>
                    {props.renderContent}
                </Show>
            </Match>
        </Switch>
    );
};

export const API = {
    fetchDataUrl: "https://easyformforge.com/get_data",
};
