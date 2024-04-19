import {createEffect, createResource, JSX, Match, Show, Switch, useContext} from "solid-js";
import {GraphContext} from "~/lib/graph";
import {setGraphData} from "~/lib/ws_events";
import {LoaderNew} from "~/components/LoaderSimple";
import {PageDesignerDragAndDrop} from "~/components/drag-drop-pages/PageDesignerDragAndDrop";

export const DataFetcher = (props: { fetchData: string, renderContent: () => JSX.Element, errorMessage?: string }) => {
    const [graph, setGraph] = useContext(GraphContext)!;
    const [WsData] = createResource(async () => {
        try {
            const response = await fetch(props.fetchData);
          return await response.json();
        } catch (error) {
            throw error;
        }
    });

    createEffect(() => {
      setGraphData(graph, setGraph, WsData());
    })

    return (
        <Switch>
            <Match when={WsData.error}>
                <div>Error: {props.errorMessage ?? WsData.error}</div>
            </Match>
            <Match when={WsData.loading}>
                <LoaderNew/>
            </Match>
            <Match when={true}>
              {graph.initialSynced ? 'true' : 'false'}
                <Show when={graph.initialSynced} fallback={<div>{JSON.stringify(graph)}</div>}>
                  <PageDesignerDragAndDrop/>
                </Show>
            </Match>
        </Switch>
    );
};

export const API = {
    fetchDataUrl: "https://easyformforge.com/get_data",
};
