import { useParams } from "@solidjs/router";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function FormConfig() {
  const params = useParams();
  const [, setLayoutStore] = useDesignerLayoutStore();

  return (
    <PageViewWrapper
      dataId={params.id}
      initializeFormStoreParent={(formStore) => {
        // direct assignment not make it reactive
        setLayoutStore?.({ get formStore() { return formStore[0]; }, get setFormStore() { return formStore[1]; } });
      }}
      isNoPermissionCheck={true}
      pageVertexName={params.entity}
    />
  );
}
// showMainFieldsOnly={true}
// showSaveCancelButton={false}