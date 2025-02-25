import { useParams, useSearchParams } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function EmailTemplate() {
  const [_searchParams] = useSearchParams();
  const params = useParams();
  return (
    <GetInitialData authenticate dontRedirectToLogin>
      <PageViewWrapper
        dontConfirmExit={true}
        hideSaveCancelButton={true}
        isNoPermissionCheck={true}
        pageId={""}
        pageVertexLabel={"EmailTemplate"}
        pageVertexName={params.template as string}
      />
    </GetInitialData>
  );
}
