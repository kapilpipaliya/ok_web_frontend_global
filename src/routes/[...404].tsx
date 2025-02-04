import { GetInitialData } from "~/GetInitialData";
import { AuthenticateUser } from "~/pages/admin_layout/AuthenticateUser";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function Notfound() {
  return (
    <GetInitialData>
      <AuthenticateUser dontRedirectToLogin={true}>
        <PageViewWrapper
          pageId={""}
          pageVertexLabel={"Page"}
          pageVertexName={"404"}
        />
      </AuthenticateUser>
    </GetInitialData>
  );
}
