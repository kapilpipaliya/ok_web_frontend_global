import { createFileRoute, useParams } from "@tanstack/solid-router";

import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export const Route = createFileRoute('/view/$entity/$entityname/$formId/')({
  component: PageShareView,
})

function PageShareView() {
  const params = useParams({strict: false});

  return (
    <GetInitialData authenticate={true} dontRedirectToLogin={true}>
      <PageViewWrapper
        pageId={params().formId}
        pageKeyName={params().entityname}
        pageVertexName={params().entity}
      />
    </GetInitialData>
  );
}
