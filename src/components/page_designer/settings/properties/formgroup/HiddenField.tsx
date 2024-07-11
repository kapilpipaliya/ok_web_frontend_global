import { Icon } from "@iconify-icon/solid";
import { type Accessor, Show, createSignal } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { ZIndex } from "~/components/ZIndex";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";
import { IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
import { addNewEdge, newEdge } from "~/lib/graph/mutate/edge";

import { AddNewState } from "../../rules/AddNewState";
import { RulesModal } from "../rules/RulesModal";
import { Label } from "./Label";

export function HiddenField(props: Readonly<{ id: string; meta: Accessor<Vertex>; metaVertex: Vertex; selectedLayout: Vertex; setValue: (meta: Vertex, data: any) => void; txnId: number; }>) {
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [graph, setGraph] = useGraph();
  let buttonRef: HTMLInputElement;

  const SelectRules = () => {
    return <DynamicComponent
      component={"TagBox"}
      data={props.selectedLayout}
      isRealTime={false}
      meta={props.meta()}
      txnId={0} />
  }

  const AddNewRule = () => {
    const handleAddNewClick = () => {
      setShowDropdown(true);
    };
    const onAddNewRule = (rowVertex?: Vertex) => {
      if (rowVertex) {
        const type = getToEdge(props.meta(), props.selectedLayout);
        const insertEdgeResult = addNewEdge(
          props.txnId,
          newEdge(graph.newVertexId, type, {}, props.selectedLayout.id, rowVertex.id),
          graph,
          setGraph,
        );
        if (insertEdgeResult.error) {
          console.error(insertEdgeResult.error);
        }
      }
      setShowDropdown(false);
    }
    return <>
      <button onClick={handleAddNewClick} title="Add New Rule">
        <Icon height={21} icon="ic:round-add" width={21} />
      </button>
      <Show when={showDropdown()}>
        <ZIndex>
          <DropdownMenu class="r:5" onClickOutside={() => setShowDropdown(false)} parentRef={buttonRef!}>
            <AddNewState onClose={onAddNewRule} />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  }

  const DisplayAllRules = () => {
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
  }

  return (
    <div class={`${props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== null ? 'b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px' : ''} flex ai:center gap:2 justify-content:space-between mt:6`}>
      <span class="f:15 flex:.5" id={props.id}>
        <Label metaVertex={props.metaVertex} />
      </span>
      <div class="flex f:15 flex:1" ref={buttonRef!}>
        <SelectRules />
        <AddNewRule />
        <DisplayAllRules />
      </div>
    </div>
  );
}
