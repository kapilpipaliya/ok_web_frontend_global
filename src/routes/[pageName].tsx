import { useParams } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function PageShareView() {
  const params = useParams();

  return (
    <GetInitialData authenticate={true} dontRedirectToLogin={true}>
      <PageViewWrapper
        pageId={""}
        pageVertexLabel={"Page"}
        pageVertexName={params.pageName}
      />
    </GetInitialData>
  );
}
