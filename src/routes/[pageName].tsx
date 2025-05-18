import { useParams } from "@solidjs/router";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function PageShareView() {
  const params = useParams();

  return (
    <PageViewWrapper pageKeyName={params.pageName} pageVertexName={"Page"} />
  );
}
