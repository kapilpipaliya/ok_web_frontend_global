import { useParams } from "@solidjs/router";
import { PageViewWrapper } from "~/pages/PageViewWrapper";


export default function PageShareView() {
  const params = useParams();
  return <PageViewWrapper pageVertexLabel={params.entity} pageVertexName={params.entityname} pageId={params.formId} />;
}
