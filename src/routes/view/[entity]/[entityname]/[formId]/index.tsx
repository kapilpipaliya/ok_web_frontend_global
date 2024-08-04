import { useParams } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { AuthenticateUser } from "~/pages/admin_layout/AuthenticateUser";

export default function PageShareView() {
  const params = useParams();

  return (
    <GetInitialData>
      <AuthenticateUser>
        <PageViewWrapper
          pageId={params.formId}
          pageVertexLabel={params.entity}
          pageVertexName={params.entityname}
        />
      </AuthenticateUser>
    </GetInitialData>
  );
}
