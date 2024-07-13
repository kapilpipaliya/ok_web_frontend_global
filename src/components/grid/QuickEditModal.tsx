import type { SetStoreFunction } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import Dismiss from "solid-dismiss";
import { Show, createSignal } from "solid-js";

import type { GraphInterface } from "~/lib/graph/graph";

import { DynamicForm } from "~/components/form/DynamicForm";

export const QuickEditModal = (p: {
  graph: GraphInterface;
  info: any;
  setGraph: SetStoreFunction<GraphInterface>;
  tableId: any;
}) => {
  const [open, setOpen] = createSignal(false);

  let btnEl;

  const closePopUp = () => {
    setOpen(false);
  };
  const modalContainerClass = "position:fixed  top:0  left:0  width:100%  height:100%  display:flex  jc:center  ai:center  z-index:20  background-color:rgba(0,0,0,0.5)";
  const modalClass = "position:relative  width:80vw  max-width:800px  padding:15px  background-color:white";

  return (
    <Show when={p.tableId}>
      <Icon
        aria-disabled={open()}
        class={
          "bg:#e6f8ff:hover color:cornflowerblue cursor:pointer p:5|5|5|5 r:5|5|5|5"
        }
        color={"grey"}
        height={22}
        icon={"fluent:edit-12-regular"}
        onClick={() => {
          setOpen(true);
        }}
        ref={btnEl}
        width={22}
      />
      <Dismiss
        animation={{ appendToElement: "menuPopup", name: "fade" }}
        closeWhenEscapeKeyIsPressed={true}
        menuButton={btnEl}
        modal
        open={open}
        setOpen={setOpen}
      >
        <div class={modalContainerClass} role="presentation">
          <div
            aria-modal="true"
            class={`${modalClass} min-w:30% p:0 r:10px`}
            role="dialog"
          >
            <div class="font-weight:bold mb:4">
              Quick Edit
              <button
                class="bg:lightgrey:hover float:right p:0|5|0|5 r:5|5|5|5"
                onClick={closePopUp}
                title="Close"
              >
                ✕
              </button>
            </div>
            <hr class="fg:lightgrey" />

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
      </Dismiss>
    </Show>
  );
};
