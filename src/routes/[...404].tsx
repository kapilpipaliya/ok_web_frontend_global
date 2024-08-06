import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { AuthenticateUser } from "~/pages/admin_layout/AuthenticateUser";

export default function Notfound() {
  return (
    <GetInitialData>
      <AuthenticateUser>
        <PageViewWrapper
          pageId={""}
          pageVertexLabel={"Page"}
          pageVertexName={"404"}
        />
      </AuthenticateUser>
    </GetInitialData>
  );
}
