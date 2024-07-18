import { Icon } from "@iconify-icon/solid";
import { Show, createSignal } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { ZIndex } from "~/components/ZIndex";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";
import { IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
import { addNewEdge, newEdge } from "~/lib/graph/mutate/edge";

import { AddNewRule } from "../../rules/AddNewRule";
import { RulesModal } from "../rules/RulesModal";
import { Label } from "./Label";

export function SelectRuleField(
  props: Readonly<{
    metaVertex: Vertex;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  let buttonRef: HTMLInputElement;

  const RenderLabel = (option: Vertex, isSelected: boolean) => {
    const [isOpenRule, setIsOpenRule] = createSignal(false);
    return (
      <div class="flex ai:center gap:4">
        <span>{option.P.name}</span>
        <button
          class="center-content flex"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpenRule(true);
          }}
        >
          <Icon
            class={"cursor:pointer opacity:.5 opacity:1:hover"}
            height={22}
            icon={"mingcute:settings-5-line"}
            width={22}
          />
        </button>
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
      collection: () => `id:'${layoutStore.formData.formData.id}'->Rule`,
      componentName: "SelectBox",
      displayName: props.metaVertex.P.displayName,
      name: props.metaVertex.P.name,
      renderLabel: RenderLabel,
      useLocalStorage: true,
    },
  } as unknown as Vertex;

  const SelectRules = () => {
    return (
      <DynamicComponent
        data={props.selectedLayout}
        isRealTime={false}
        meta={meta}
        txnId={layoutStore.formData.txnId}
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
            graph.newVertexId,
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
        <button onClick={handleAddNewClick} title="Add New Rule">
          <Icon height={21} icon="ic:round-add" width={21} />
        </button>
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

  /*const DisplayAllRules = () => {
    const [showRuleSettings, setShowRuleSettings] = createSignal(false);
    const onDisplayAllRules = () => {
      setShowRuleSettings(true);
    };
    return <>
      <button class="" onClick={onDisplayAllRules}>
        <Icon
          class={"cursor:pointer opacity:.5 opacity:1:hover"}
          height={22}
          icon={"mingcute:settings-5-line"}
          width={22} />
      </button>
      <Show when={showRuleSettings()}>
        <ZIndex>
          <RulesModal closeModal={() => setShowRuleSettings(false)} onSubmit={() => setShowRuleSettings(false)} />
        </ZIndex>
      </Show>
    </>
  }*/

  return (
    <div
      class={`${props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label metaVertex={props.metaVertex} />
      </span>
      <div class="flex f:15 flex:1" ref={buttonRef!}>
        <SelectRules />
        <AddNewRuleButton />
        {/* <DisplayAllRules /> */}
      </div>
    </div>
  );
}
