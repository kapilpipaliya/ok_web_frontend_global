import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function HomePage() {
  return (
    <GetInitialData authenticate={false} dontRedirectToLogin={true}>
      <PageViewWrapper pageKeyName={"Home"} pageVertexName={"Page"} />
    </GetInitialData>
  );
}
