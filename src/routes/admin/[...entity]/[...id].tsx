import {FullDashboard} from "~/pages/Dashboard";
import {useParams} from "@solidjs/router";
import {AbstractSingleForm} from "~/components/DynamicForm";
import {config} from "@master/css";
import {Show} from "solid-js";
import {PageView_} from "~/pages/PageView";

export default function admin() {
    const params = useParams();
    const [entity, id] = params.entity.toString().split('/')
    return <Show when={entity && !id} fallback={<AbstractSingleForm
        graph={graph[0]}
        formId={entity}
        id={id}
        config={config}
        setGraph={graph[1]}/>}>
        <PageView_ count={1} id={"home"}/>
    </Show>

}
