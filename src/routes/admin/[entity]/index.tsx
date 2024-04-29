import {useParams} from "@solidjs/router";
import {AbstractSingleForm} from "~/components/DynamicForm";
import {config} from "@master/css";
import {createEffect, createResource, Show, useContext} from "solid-js";
import {PageView_} from "~/pages/PageView";
import {GraphContext} from "~/lib/graph";
import {API, DataFetcher} from "~/components/DataFetcher";
import {setGraphData} from "~/lib/ws_events";
import {AbstractSingleGrid} from "~/pages/Grids";

export default function admin() {
    const params = useParams();
    console.log(params.entity)
    return <DataFetcher renderContent={<AbstractSingleGrid tableId={params.entity}/>} fetchData={API.fetchDataUrl}/>
}
