import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useDesignerFormIdContext } from "~/components/page_designer/context/LayoutContext";
import { IconButton } from "~/components/styled/IconButton";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";

import { Label } from "./Label";

export function SelectPageField(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: any) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph] = useGraph();
  let buttonRef: HTMLInputElement;

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const RenderLabel = (option: Vertex, _isSelected: boolean) => {
    return (
      <div class="flex ai:center gap:4">
        <span>{option.P.key}</span>
        <IconButton
          icon={"mingcute:settings-5-line"}
          iconClass={"opacity:.5 opacity:1:hover"}
          onClick={(e) => {
            e.stopPropagation();
            window.open(`/admin/Page/${option.id}`, "_blank");
          }}
          size={22}
        />
      </div>
    );
  };

  const meta = {
    P: {
      class: "flex:1",
      collection: `g:'Page'`,
      componentName: "Select",
      displayName: props.meta.P.displayName,
      key: props.meta.P.key,
      renderLabel: RenderLabel,
    },
  } as unknown as Vertex;

  const SelectThankYouPage = () => {
    return (
      <DynamicComponent
        componentName={"Select"}
        data={props.selectedLayout}
        isNoPermissionCheck={true}
        isRealTime={false}
        meta={meta}
        noLabel
        txnId={formStoreVertex()?.P.txnId}
      />
    );
  };

  const AddNewPageButton = () => {
    const handleAddNewClick = () => {
      window.open("/admin/Page/new", "_blank");
    };
    return (
      <IconButton
        icon="ic:round-add"
        onClick={handleAddNewClick}
        size={21}
        title="Add New Rule"
      />
    );
  };

  return (
    <div
      class={`${props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.meta.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        {/* Show Page After Submission Form */}
        <Label meta={props.meta} />
      </span>
      <div class="flex f:15 flex:1" ref={buttonRef!}>
        <SelectThankYouPage />
        <AddNewPageButton />
      </div>
    </div>
  );
}
