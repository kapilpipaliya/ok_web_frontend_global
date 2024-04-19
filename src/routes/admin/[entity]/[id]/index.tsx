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
    const [entity, id] = params.entity.toString().split('/')
    return <DataFetcher fetchData={API.fetchDataUrl}
                        renderContent={
                            <AbstractSingleForm
                                graph={graph}
                                formId={entity}
                                id={id}
                                config={config}
                                setGraph={setGraph}/>
                        }/>

}

