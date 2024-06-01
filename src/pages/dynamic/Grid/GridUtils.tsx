import { Icon } from "@iconify-icon/solid";
import type { CellContext } from "@tanstack/solid-table";
import { graph } from "neo4j-driver";
import Dismiss from "solid-dismiss";
import { Accessor, createSignal, Show } from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";
import { AbstractSingleForm } from "~/components/dynamic/components/DynamicForm";
import {
  selectedValue,
  collectionNameDisplayExpr,
} from "~/components/dynamic/fields/input/SelectInputField";
import type { FieldAttribute } from "~/lib/Type";
import type { IFormContext } from "~/lib/Utils";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";

export const QuickEditModal = (p: {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  tableId: any;
  info: any;
}) => {
  const [open, setOpen] = createSignal(false);
  const config = createStore({} as { formData: IFormContext });
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
        class={"cursor:pointer bg:#e6f8ff:hover r:5|5|5|5 p:5|5|5|5 color:cornflowerblue"}
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
        animation={{ name: "fade", appendToElement: "menuPopup" }}
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
                style={{ float: "right" }}
              >
                ✕
              </button>
            </div>
            <hr class={"fg:lightgrey"} />

            <div class={"p:3 mt:10 max-h:50vh overflow:auto"}>
              <AbstractSingleForm
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

export const SelectValue = (props: {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  attribute: FieldAttribute;
  info: CellContext<any, any>;
}) => {
  const vertex = selectedValue(
    {
      P: props.attribute,
    } as unknown as Vertex,
    props.info.row.original,
    props.graph,
  );
  if (vertex[0]) {
    return getSelectionOptions(
      props.graph,
      props.setGraph,
      [props.graph.vertexes[vertex[0]]],
      props.attribute.props?.displayExpr ||
        collectionNameDisplayExpr(
          props.graph,
          props.attribute.props?.collection,
        ) ||
        `::'P.${IdAttr}'`,
    ).vertexes;
  }
  return "";
};

export const TagValue = (props: {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  attribute: FieldAttribute;
  info: CellContext<any, any>;
}) => {
  const vertex = selectedValue(
    {
      P: props.attribute,
    } as unknown as Vertex,
    props.info.row.original,
    props.graph,
  );
  if (vertex) {
    const textArray = [];
    for (const v of vertex) {
      const text = getSelectionOptions(
        props.graph,
        props.setGraph,
        [props.graph.vertexes[v]],
        props.attribute.props?.displayExpr || `::'P.${IdAttr}'`,
      ).vertexes;
      textArray.push(text);
    }
    return textArray.join(", ");
  }
  return "";
};
