import type {GraphInterface} from "~/lib/graph/graph";
import type {SetStoreFunction} from "solid-js/store";
import {createSignal, Show} from "solid-js";
import {Icon} from "@iconify-icon/solid";
import Dismiss from "solid-dismiss";
import {DynamicForm} from "~/components/form/DynamicForm";

export const QuickEditModal = (p: {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  tableId: any;
  info: any;
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
        ref={btnEl}
        height={22}
        width={22}
        color={"grey"}
        aria-disabled={open()}
        class={
          "cursor:pointer bg:#e6f8ff:hover r:5|5|5|5 p:5|5|5|5 color:cornflowerblue"
        }
        onClick={() => {
          setOpen(true);
        }}
        icon={"fluent:edit-12-regular"}
      />
      <Dismiss
        closeWhenEscapeKeyIsPressed={true}
        menuButton={btnEl}
        open={open}
        setOpen={setOpen}
        menuPopup={btnPopUp}
        animation={{name: "fade", appendToElement: "menuPopup"}}
        modal
      >
        <div class="modal-container" role="presentation" ref={btnPopUp}>
          <div
            class="modal min-w:30% r:10px p:0"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
          >
            <div class={"mb:4 font-weight:bold"}>
              Quick Edit
              <button
                title={"Close"}
                onClick={closePopUp}
                class={"bg:lightgrey:hover r:5|5|5|5 p:0|5|0|5"}
                style={{float: "right"}}
              >
                ✕
              </button>
            </div>
            <hr class={"fg:lightgrey"}/>

            <div class={"p:3 mt:10 max-h:50vh overflow:auto"}>
              <DynamicForm
                formId={p.tableId}
                graph={p.graph}
                id={p.info.row.original.id}
                buttonAlign="end"
                isDialogContext={true}
                showMainFieldsOnly={true}
                importExportButtons={false}
                doMount={false}
                setGraph={p.setGraph}
              />
            </div>
          </div>
        </div>
      </Dismiss>
    </Show>
  );
};