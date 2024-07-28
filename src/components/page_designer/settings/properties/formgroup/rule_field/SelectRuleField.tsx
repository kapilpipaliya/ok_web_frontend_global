import { Show, createSignal } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { IconButton } from "~/components/IconButton";
import { ZIndex } from "~/components/ZIndex";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";
import { IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
import { addNewEdge, newEdge } from "~/lib/graph/mutate/edge";

import { RulesModal } from "../../../../rules/RulesModal";
import { AddNewRule } from "../../../rules/AddNewRule";
import { Label } from "../Label";

interface SelectRuleFieldProps {
  metaVertex: Vertex;
  selectedLayout: Vertex;
  txnId: number;
}

interface RenderLabelProps {
  isSelected: boolean;
  option: Vertex;
}

interface SelectRulesProps {
  data: Vertex;
  meta: Vertex;
  txnId: number;
}

interface AddNewRuleButtonProps {
  meta: Vertex;
  selectedLayout: Vertex;
  txnId: number;
}

export function RenderRuleOptionLabel(props: RenderLabelProps) {
  const [isOpenRule, setIsOpenRule] = createSignal(false);

  return (
    <div class="flex ai:center gap:4">
      <span>{props.option.P.name}</span>
      <IconButton
        class="center-content flex"
        icon={"mingcute:settings-5-line"}
        iconCss={"opacity:.5 opacity:1:hover"}
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
            selectedRule={props.option}
          />
        </ZIndex>
      </Show>
    </div>
  );
}

export function SelectRules(props: SelectRulesProps) {
  return (
    <DynamicComponent
      data={props.data}
      isRealTime={false}
      meta={props.meta}
      txnId={props.txnId}
    />
  );
}

export function AddNewRuleButton(props: AddNewRuleButtonProps) {
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [graph, setGraph] = useGraph();
  let buttonRef: HTMLInputElement;

  const handleAddNewClick = () => {
    setShowDropdown(true);
  };

  const onAddNewRule = (rowVertex?: Vertex) => {
    if (rowVertex) {
      const type = getToEdge(props.meta, props.selectedLayout);
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
      <IconButton icon="ic:round-add" onClick={handleAddNewClick} size={21} title="Add New Rule" />
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
}

export function DisplayAllRules() {
  const [showRuleSettings, setShowRuleSettings] = createSignal(false);

  const onDisplayAllRules = () => {
    setShowRuleSettings(true);
  };

  return (
    <>
      <button class="" onClick={onDisplayAllRules}>
        <IconButton
          class={"cursor:pointer opacity:.5 opacity:1:hover"}
          icon={"mingcute:settings-5-line"}
          size={22}
        />
      </button>
      <Show when={showRuleSettings()}>
        <ZIndex>
          <RulesModal closeModal={() => setShowRuleSettings(false)} onSubmit={() => setShowRuleSettings(false)} />
        </ZIndex>
      </Show>
    </>
  );
}

export function SelectRuleField(props: SelectRuleFieldProps) {
  const [layoutStore] = useDesignerLayoutStore();
  let buttonRef: HTMLInputElement;

  const meta = {
    P: {
      class: "flex:1",
      collection: () => `id:'${layoutStore.formData.formData.id}'->Rule`,
      componentName: "SelectBox",
      displayName: props.metaVertex.P.displayName,
      name: props.metaVertex.P.name,
      renderLabel: RenderRuleOptionLabel,
      useLocalStorage: true,
    },
  } as unknown as Vertex;

  return (
    <div
      class={`${props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label metaVertex={props.metaVertex} />
      </span>
      <div class="flex f:15 flex:1" ref={buttonRef!}>
        <SelectRules data={props.selectedLayout} meta={meta} txnId={props.txnId} />
        <AddNewRuleButton meta={meta} selectedLayout={props.selectedLayout} txnId={props.txnId} />
        <DisplayAllRules />
      </div>
    </div>
  );
}
