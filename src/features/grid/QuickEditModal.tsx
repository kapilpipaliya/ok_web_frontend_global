import type { Setter } from "solid-js";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { CustomModal } from "../../components/styled/CustomModal";

// Deprecated
export const QuickEditModal = (p: {
  disabled?: boolean;
  info: any;
  onClose: Setter<boolean>;
  tableId: string;
}) => {
  const closePopUp = () => {
    p.onClose(false);
  };

  return (
    <CustomModal
      dialogClass="min-w:30% p:6"
      open={() => !!p.tableId}
      setOpen={() => p.onClose(false)}
      title="Quick Edit"
    >
      <PageViewWrapper
        closePopUp={closePopUp}
        dataId={p.info.row.original.id}
        pageVertexName={p.tableId}
      />
    </CustomModal>
  );
};
