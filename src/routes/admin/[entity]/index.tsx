import {useParams} from "@solidjs/router";
import {AbstractSingleForm} from "~/components/DynamicForm";
import {config} from "@master/css";
import {Show, useContext} from "solid-js";
import {PageView_} from "~/pages/PageView";
import {GraphContext} from "~/lib/graph";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function admin() {
    const params = useParams();
    const [graph, setGraph] = useContext(GraphContext)!;
    return <div>
        <DataFetcher renderContent={<PageView_ count={1} id={"home"}/>} fetchData={API.fetchDataUrl}/>
    </div>
}

