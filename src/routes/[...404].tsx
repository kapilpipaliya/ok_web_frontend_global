import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function Notfound() {
  return (
    <GetInitialData authenticate={true} dontRedirectToLogin={true}>
      <PageViewWrapper
        pageKeyName={"404"}
        pageVertexName={"Page"}
        isNoPermissionCheck={true}
      />
    </GetInitialData>
  );
}
