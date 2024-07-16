import type { SetStoreFunction } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import { Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

import type { GraphInterface } from "~/lib/graph/graph";

import { DynamicForm } from "~/components/form/DynamicForm";

export const QuickEditModal = (p: {
  graph: GraphInterface;
  info: any;
  setGraph: SetStoreFunction<GraphInterface>;
  tableId: any;
}) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const closePopUp = () => {
    setIsOpen(false);
  };
  const modalContainerClass = "position:fixed  top:0  left:0  width:100%  height:100%  display:flex  jc:center  ai:center  z-index:20  background-color:rgba(0,0,0,0.5)";
  const modalClass = "position:relative  width:80vw  max-width:800px  padding:15px  background-color:white";

  return (
    <Show when={p.tableId}>
      <Icon
        aria-disabled={isOpen()}
        class="radius:5px background-color:#e6f8ff:hover color:cornflowerblue cursor:pointer padding:5px"
        height={22}
        icon="fluent:edit-12-regular"
        onClick={() => setIsOpen(true)}
        width={22}
      />
      <Show when={isOpen()}>
        <Portal>
          <div class={modalContainerClass} onClick={closePopUp}>
            <div class={`${modalClass} min-w:30% p:0 r:10px`} onClick={(e) => e.stopPropagation()} role="dialog">
              <div class="display:flex font-weight:bold jc:space-between mb:4">
                <span>Quick Edit</span>
                <button
                  class="bg:lightgrey:hover float:right p:0|5|0|5 r:5px"
                  onClick={closePopUp}
                  title="Close"
                >
                  ✕
                </button>
              </div>
              <hr class="color:lightgrey" />
              <div class="max-h:50vh mt:10 overflow:auto p:3">
                <DynamicForm
                  buttonAlign="end"
                  closePopUp={closePopUp}
                  doMount={false}
                  formId={p.tableId}
                  graph={p.graph}
                  id={p.info.row.original.id}
                  importExportButtons={false}
                  setGraph={p.setGraph}
                  showMainFieldsOnly={true}
                />
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </Show>
  );
};
