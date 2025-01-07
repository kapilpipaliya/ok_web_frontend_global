import { createSignal, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IconButton } from "~/components/styled/IconButton";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewEdge, newEdge } from "~/lib/graph/mutate/edge";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { RulesModal } from "../../../rules/RulesModal";
import { AddNewRule } from "../../rules/AddNewRule";
import { Label } from "./Label";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";

export function SelectPermField(
  props: Readonly<{
    metaVertex: Vertex;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  let buttonRef: HTMLInputElement;

  const layoutStore = () => graph.vertexes[layoutStoreId].P;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const RenderLabel = (option: Vertex, _isSelected: boolean) => {
    const [isOpenRule, setIsOpenRule] = createSignal(false);
    return (
      <div class="flex ai:center gap:4">
        <span>{option.P.key}</span>
        <IconButton
          class="center-content flex"
          icon={"mingcute:settings-5-line"}
          iconClass={"opacity:.5 opacity:1:hover"}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpenRule(true);
          }}
          size={22}
        />
        <Show when={isOpenRule()}>
          <ZIndex>
            <RulesModal
              closeModal={() => setIsOpenRule(false)}
              onSubmit={() => setIsOpenRule(false)}
              selectedRule={option}
            />
          </ZIndex>
        </Show>
      </div>
    );
  };

  const meta = {
    P: {
      class: "flex:1",
      collection: () => `id:'${formStoreVertex().P.formDataId}'->Rule`,
      componentName: "Select",
      displayName: props.metaVertex.P.displayName,
      key: props.metaVertex.P.key,
      renderLabel: RenderLabel,
      useLocalStorage: true,
    },
  } as unknown as Vertex;

  const SelectRules = () => {
    return (
      <DynamicComponent
        data={props.selectedLayout}
        isNoPermissionCheck={true}
        isRealTime={false}
        meta={meta}
        noLabel
        txnId={formStoreVertex().P.txnId}
      />
    );
  };

  const AddNewRuleButton = () => {
    const handleAddNewClick = () => {
      setShowDropdown(true);
    };
    const onAddNewRule = (rowVertex?: Vertex) => {
      if (rowVertex) {
        const type = getToEdge(meta, props.selectedLayout);
        const insertEdgeResult = addNewEdge(
          props.txnId,
          newEdge(
            generateNewVertexId(graph, setGraph),
            type,
            {},
            props.selectedLayout.id,
            rowVertex.id,
          ),
          graph,
          setGraph,
        );
        if (insertEdgeResult.error) {
          console.error(insertEdgeResult.error);
        }
      }
      setShowDropdown(false);
    };
    return (
      <>
        <IconButton
          icon="ic:round-add"
          onClick={handleAddNewClick}
          size={21}
          title="Add New Rule"
        />
        <Show when={showDropdown()}>
          <ZIndex>
            <DropdownMenu
              class="r:5"
              onClickOutside={() => setShowDropdown(false)}
              parentRef={buttonRef!}
            >
              <AddNewRule onClose={onAddNewRule} />
            </DropdownMenu>
          </ZIndex>
        </Show>
      </>
    );
  };

  return (
    <div
      class={`${props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label meta={props.metaVertex} />
      </span>
      <div class="flex f:15 flex:1" ref={buttonRef!}>
        <SelectRules />
        <AddNewRuleButton />
      </div>
    </div>
  );
}
