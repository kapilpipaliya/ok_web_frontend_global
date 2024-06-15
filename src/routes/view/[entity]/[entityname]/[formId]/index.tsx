import { useParams } from "@solidjs/router";
import { PageViewBase } from "~/pages/PageView";


export default function PageShareView() {
  const params = useParams();
  return <PageViewBase pageVertexLabel={params.entity} pageVertexName={params.entityname} pageId={params.formId} />;
}
