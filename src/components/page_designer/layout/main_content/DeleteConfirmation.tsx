import { Show } from "solid-js";
import { ZIndex } from "~/components/fields/ZIndex";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { DeleteAttributeDialog } from "../DeleteRuleDialog";

export function DeleteConfirmation() {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  return (
    <Show
      when={Object.keys(formStoreVertex()?.P.usedAttrsInRules ?? {}).length > 0 ||
        formStoreVertex()?.P.usedAttrsInUniqueConstraints.length > 0 ||
        formStoreVertex()?.P.usedAttrsInNameKeys.length > 0 ||
        formStoreVertex()?.P.shouldContainAtLeastOneForm}
    >
      <ZIndex>
        <DeleteAttributeDialog />
      </ZIndex>
    </Show>
  );
}
