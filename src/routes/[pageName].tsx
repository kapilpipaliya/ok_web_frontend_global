import { useParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

export default function PageShareView() {
  const params = useParams();
  const [graph] = useGraph();

  const pageVertex = createMemo(() => {
    if (!params.pageName) return undefined;
    return findVertexByLabelAndUniqueId(graph, "Page", "key", params.pageName);
  });

  return (
    <PageViewWrapper
      formMetaId={pageVertex()?.id}
      pageKeyName={params.pageName}
      pageVertexName={"Page"}
    />
  );
}
