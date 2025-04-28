import { useParams } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function PageShareView() {
  const params = useParams();

  return (
    <GetInitialData authenticate={false} dontRedirectToLogin={true}>
      <PageViewWrapper pageKeyName={params.pageName} pageVertexName={"Page"} />
    </GetInitialData>
  );
}
