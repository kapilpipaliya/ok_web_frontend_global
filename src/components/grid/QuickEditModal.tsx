import type { Setter } from "solid-js";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { CustomModal2 } from "../CustomModal2";

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
    <CustomModal2
      isOpen={!!p.tableId}
      onClose={p.onClose}
      title="Quick Edit"
    >
      <PageViewWrapper
        closePopUp={closePopUp}
        dataId={p.info.row.original.id}
        pageVertexName={p.tableId}
      />
    </CustomModal2>
  );
};
