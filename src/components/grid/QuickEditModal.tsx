import type {SetStoreFunction} from "solid-js/store";

import {Icon} from "@iconify-icon/solid";
import Dismiss from "solid-dismiss";
import {Show, createSignal} from "solid-js";

import type {GraphInterface} from "~/lib/graph/graph";

import {DynamicForm} from "~/components/form/DynamicForm";

export const QuickEditModal = (p: {
  graph: GraphInterface;
  info: any;
  setGraph: SetStoreFunction<GraphInterface>;
  tableId: any;
}) => {
  const [open, setOpen] = createSignal(false);

  let btnEl;
  let btnPopUp;

  const closePopUp = () => {
    setOpen(false);
  };

  return (
    <Show when={p.tableId}>
      <Icon
        aria-disabled={open()}
        class={
          "cursor:pointer bg:#e6f8ff:hover r:5|5|5|5 p:5|5|5|5 color:cornflowerblue"
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
        animation={{appendToElement: "menuPopup", name: "fade"}}
        closeWhenEscapeKeyIsPressed={true}
        menuButton={btnEl}
        menuPopup={btnPopUp}
        modal
        open={open}
        setOpen={setOpen}
      >
        <div class="modal-container" ref={btnPopUp} role="presentation">
          <div
            aria-modal="true"
            class="modal min-w:30% r:10px p:0"
            role="dialog"
            tabindex="-1"
          >
            <div class="mb:4 font-weight:bold">
              Quick Edit
              <button
                class="bg:lightgrey:hover r:5|5|5|5 p:0|5|0|5 float:right"
                onClick={closePopUp}
                title="Close"
              >
                ✕
              </button>
            </div>
            <hr class="fg:lightgrey"/>

            <div class="p:3 mt:10 max-h:50vh overflow:auto">
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