import { useParams } from "@solidjs/router";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

export function FormConfig() {
  const params = useParams();
  return (
    <PageViewWrapper dataId={params.id} isNoPermissionCheck={true} pageVertexName={params.entity} />
  );
}
// showMainFieldsOnly={true}
// showSaveCancelButton={false}