import { useParams } from "@tanstack/solid-router";
import { createFileRoute } from "@tanstack/solid-router";

import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export const Route = createFileRoute('/[pageName]')({
  component: PageShareView,
})

function PageShareView() {
  const params = useParams({strict: false});

  return (
    <GetInitialData authenticate={true} dontRedirectToLogin={true}>
      <PageViewWrapper
        pageKeyName={params().pageName}
        pageVertexName={"Page"}
      />
    </GetInitialData>
  );
}
