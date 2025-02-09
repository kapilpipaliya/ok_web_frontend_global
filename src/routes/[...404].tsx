import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function Notfound() {
  return (
    <GetInitialData authenticate={true} dontRedirectToLogin={true}>
      <PageViewWrapper
        pageId={""}
        pageVertexLabel={"Page"}
        pageVertexName={"404"}
      />
    </GetInitialData>
  );
}
