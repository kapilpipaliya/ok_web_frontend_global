import {useParams} from "@solidjs/router";
import {createEffect, createSignal, For, on, Show, useContext} from "solid-js";
import {WsContext} from "../utils/ws_events_dispatcher";
import {getFormMetaData, Record} from "../lib/Record";
import {findVertexByLabelAndUniqueId} from "../lib/Vertex";
import {PageView} from "../components/input/GenaricField";
import {graph} from "../lib/graph";

export const PageView_ = (props: {id: string, count: number}) => {
    const {Ws} = useContext(WsContext);
    if (!props.id) return "Page ID not specified.";
    const record = new Record({ws: Ws});
    const result = findVertexByLabelAndUniqueId("Page", "name", props.id);
    if (!result) return "No Page Found";
    const loadResult = record.load(result.id);
    if (loadResult.error) return loadResult.error;

    const form = getFormMetaData("Page");
    if (form.error) return form.error;
    record.createMeta(form.form!);

    return <PageView number={props.count} vertex={record?.vertex}/>
}

export const PagePreview = (props: {}) => {
    const params = useParams();
    const [count, setCount] = createSignal(1);

    createEffect(on(() => params.id, v => setCount(v => v + 1), {defer: true}));

    return <Show when={count()} keyed><PageView_ id={params.id} count={count()}/></Show>
}
export const RobotsTxt = (props: {}) => {
    return <>
        User-agent: *
        Allow: /

        Sitemap: {window.location.origin + '/sitemap.txt'}
    </>
}
export const SiteMap = (props: {}) => {
    return <For each={graph.vertexLabelIdMap["Page"]?.filter(vertex => graph.vertexes[vertex].P.public)}>
        {vertex => <>{window.location.origin + graph.vertexes[vertex].P.name}</>}
    </For>
}