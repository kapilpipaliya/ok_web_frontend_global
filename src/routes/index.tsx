import { createFileRoute } from "@tanstack/solid-router";

import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export const Route = createFileRoute('/')({
  component: Notfound,
})

function Notfound() {
  return (
    <GetInitialData authenticate={true} dontRedirectToLogin={true}>
      <PageViewWrapper
        pageKeyName={"home"}
        pageVertexName={"home"}
      />
    </GetInitialData>
  );
}
