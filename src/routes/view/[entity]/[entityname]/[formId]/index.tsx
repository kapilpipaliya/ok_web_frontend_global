import { useParams } from "@solidjs/router";

import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { AuthenticateUser } from "~/pages/admin_layout/AuthenticateUser";

import { GetInitialData } from "../../../../../GetInitialData";

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
