import {useParams} from "@solidjs/router";
import {createEffect, createSignal, For, on, Show, useContext} from "solid-js";
import {WsContext} from "../utils/ws_events_dispatcher";
import {getFormMetaData, Record} from "../lib/Record";
import {findVertexByLabelAndUniqueId} from "../lib/Vertex";
import {PageView} from "./input/GenaricField";
import {graph} from "../lib/graph";

export const [selectedLayout, setSelectedLayout] = createSignal({vertexId: -1, itemIndex: -1} as {vertexId: number, itemIndex?: number});

export const PagePreview = (props: {}) => {
    const params = useParams();
    const {Ws} = useContext(WsContext);
    const [count, setCount] = createSignal(1);

    createEffect(on(() => params.id, v => setCount(v => v + 1), {defer: true}));

    const PageView_ = () => {
        if (!params.id) return "Page ID not specified.";
        const record = new Record({ws: Ws});
        const result = findVertexByLabelAndUniqueId("Page", "name", params.id);
        if (!result) return "No Page Found";
        const loadResult = record.load(result.id);
        if (loadResult.error) return loadResult.error;

        const form = getFormMetaData("Page");
        if (form.error) return form.error;
        record.createMeta(form.form!);

        return <PageView number={count()} vertex={record?.vertex}/>
    }
    return <Show when={count()} keyed><PageView_/></Show>
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