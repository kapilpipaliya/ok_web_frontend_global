import { useParams } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { AuthenticateUser } from "~/pages/admin_layout/AuthenticateUser";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function PageShareView() {
  const params = useParams();

  return (
    <GetInitialData>
      {/* <AuthenticateUser> */}
        <PageViewWrapper
          pageId={""}
          pageVertexLabel={"Page"}
          pageVertexName={params.pageName}
        />
      {/* </AuthenticateUser> */}
    </GetInitialData>
  );
}
