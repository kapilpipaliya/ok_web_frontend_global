import { useParams, useSearchParams } from "@solidjs/router";

import { getMemberVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { useGraph } from "~/lib/graph/graph";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function EmailTemplate() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  return (
    <PageViewWrapper
      dontConfirmExit={true}
      hideSaveCancelButton={true}
      isNoPermissionCheck={true}
      pageId={""}
      pageVertexLabel={"EmailTemplate"}
      pageVertexName={params.template as string}
    />

  );
} 