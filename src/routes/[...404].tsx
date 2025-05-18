import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function Notfound() {
  return (
    <PageViewWrapper
      isNoPermissionCheck={true}
      pageKeyName={"404"}
      pageVertexName={"Page"}
    />
  );
}
