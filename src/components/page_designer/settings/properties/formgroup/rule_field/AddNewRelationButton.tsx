import { type Component, createSignal, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IconButton } from "~/components/styled/IconButton";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewEdge, newEdge } from "~/lib/graph/mutate/edge";

export interface AddNewRelationButtonProps {
  component: Component<{ onClose: (rowVertex?: Vertex) => void }>;
  meta: Vertex;
  selectedLayout: Vertex;
  title: string;
  txnId: number;
}

export function AddNewRelationButton(props: AddNewRelationButtonProps) {
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [graph, setGraph] = useGraph();
  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  const handleAddNewClick = () => {
    setShowDropdown(true);
  };

  const afterAddNewRule = (rowVertex?: Vertex) => {
    // TODO: add  unique save point
    if (rowVertex) {
      const type = getToEdge(props.meta, props.selectedLayout);
      const insertEdgeResult = addNewEdge(
        props.txnId,
        newEdge(
          graph.newVertexId(),
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
        ref={setReference}
        size={21}
        title={props.title}
      />
      <Show when={showDropdown()}>
        <ZIndex>
          <DropdownMenu
            class="r:5"
            onClickOutside={() => setShowDropdown(false)}
            parentRef={reference()!}
            placement="bottom-end"
          >
            <Dynamic component={props.component} onClose={afterAddNewRule} />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
