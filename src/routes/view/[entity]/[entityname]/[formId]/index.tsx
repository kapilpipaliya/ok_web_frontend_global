import { useParams } from "@solidjs/router";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { GetInitialData } from "../../../../../GetInitialData";

export default function PageShareView() {
  const params = useParams();

  return (
    <GetInitialData>
      <PageViewWrapper pageId={params.formId} pageVertexLabel={params.entity} pageVertexName={params.entityname} />
    </GetInitialData>
  );
}

