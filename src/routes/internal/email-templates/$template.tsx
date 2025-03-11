import { createFileRoute, useParams } from "@tanstack/solid-router";

import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export const Route = createFileRoute('/internal/email-templates/$template')({
  component: EmailTemplate,
})

function EmailTemplate() {
  const params = useParams({strict: false});
  return (
      <PageViewWrapper
        dontConfirmExit={true}
        hideSaveCancelButton={true}
        isNoPermissionCheck={true}
        pageKeyName={params().template as string}
        pageVertexName={"EmailTemplate"}
      />
  );
}
