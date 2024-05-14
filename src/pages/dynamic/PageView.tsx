import { useParams } from "@solidjs/router";
import {
 createEffect,
 createSignal,
 For,
 on,
 Show,
 untrack,
 useContext
} from "solid-js";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { createMeta, loadForm } from "~/lib/graph/get/sync/graph_fns";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { PageView } from "~/components/dynamic/fields/static/GenaricField";
import { GraphContext, GraphInterface } from "~/lib/graph/graph";
import { Store } from "solid-js/store";
import { getFormMetaData } from "~/lib/graph/get/sync/graph_functions";

export const PageView_ = (props: { id: string; count: number }) => {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  if (!props.id) return "Page ID not specified.";
  const result = findVertexByLabelAndUniqueId(graph, "Page", "name", props.id);
  if (!result) return "No Page Found";

  const loadResult = loadForm(graph, result.id);
  if (loadResult.error) return loadResult.error;
  const dataVertex = loadResult.vertex!;

  const form = getFormMetaData(graph, setGraph, "Page");
  if (form.error) return form.error;

  const metaVertexResult = untrack(() =>
    createMeta(form.form!, graph, setGraph),
  );

  if (metaVertexResult.error) {
    console.error(metaVertexResult.error);
    return metaVertexResult.error;
  }

  return <PageView number={props.count} vertex={dataVertex} />;
};

export const PagePreview = (props: {}) => {
  const params = useParams();
  const [count, setCount] = createSignal(1);

  createEffect(
    on(
      () => params.id,
      (v) => setCount((v) => v + 1),
      { defer: true },
    ),
  );

  return (
    <Show when={count()} keyed>
      <PageView_ id={params.id} count={count()} />
    </Show>
  );
};
export const RobotsTxt = (props: {}) => {
  return (
    <>
      User-agent: * Allow: / Sitemap: {window.location.origin + "/sitemap.txt"}
    </>
  );
};
export const SiteMap = (props: {}, graph: Store<GraphInterface>) => {
  return (
    <For
      each={graph.vertexLabelIdMap["Page"]?.filter(
        (vertex) => graph.vertexes[vertex].P.public,
      )}
    >
      {(vertex) => (
        <>{window.location.origin + graph.vertexes[vertex].P.name}</>
      )}
    </For>
  );
};
