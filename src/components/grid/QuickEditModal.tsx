import type { SetStoreFunction } from "solid-js/store";

import { type Setter, Show, } from "solid-js";
import { Portal } from "solid-js/web";

import type { GraphInterface } from "~/lib/graph/graph";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { useZIndex } from "../ZIndex";

export const QuickEditModal = (p: {
  disabled?: boolean;
  graph: GraphInterface;
  info: any;
  onClose: Setter<boolean>;
  setGraph: SetStoreFunction<GraphInterface>;
  tableId: string;
}) => {
  const zIndex = useZIndex();
  const closePopUp = () => {
    p.onClose(false)
  };
  const modalContainerClass = `position:fixed  top:0  left:0  width:100%  height:100%  display:flex  jc:center  ai:center  z-index:${zIndex}  background-color:rgba(0,0,0,0.5)`;
  const modalClass = "position:relative  width:80vw  max-width:800px  padding:15px  background-color:white";

  return (
    <Show when={p.tableId}>
      <Portal>
        <div class={modalContainerClass}>
          <div class={`${modalClass} min-w:30% p:0 r:10px`} role="dialog">
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
            <PageViewWrapper closePopUp={closePopUp} dataId={p.info.row.original.id} pageVertexName={p.tableId} />
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};
