import { useParams } from "@solidjs/router";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function PageShareView() {
  const params = useParams();

  return (
    <PageViewWrapper
      pageId={params.formId}
      pageKeyName={params.entityname}
      pageVertexName={params.entity}
    />
  );
}
