import { useParams } from "@solidjs/router";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { GetInitialData } from "../../../../../GetInitialData";

export default function PageShareView() {
  const params = useParams();

  return (
    <GetInitialData>
      <PageViewWrapper pageVertexLabel={params.entity} pageVertexName={params.entityname} pageId={params.formId} />
    </GetInitialData>
  );
}

