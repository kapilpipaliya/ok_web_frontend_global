

import { IconButton } from "~/components/IconButton";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { IdAttr, type Vertex } from "~/lib/graph/graph";

import { Label } from "./Label";

export function SelectPageField(
  props: Readonly<{
    meta: Vertex;
    metaVertex: Vertex;
    selectedLayout: Vertex;
    setValue: (meta: Vertex, data: any) => void;
    txnId: number;
  }>,
) {
  const [layoutStore] = useDesignerLayoutStore();
  let buttonRef: HTMLInputElement;

  const RenderLabel = (option: Vertex, isSelected: boolean) => {

    return (
      <div class="flex ai:center gap:4">
        <span>{option.P.name}</span>
        <IconButton

          icon={"mingcute:settings-5-line"}
          iconClass={"opacity:.5 opacity:1:hover"}
          onClick={(e) => {
            e.stopPropagation();
            window.open(`/admin/ThankYouPage/${option.id}`, "_blank");
          }}
          size={22}
        />

      </div>
    );
  };

  const meta = {
    P: {
      class: "flex:1",
      collection:  `g:'ThankYouPage'`,
      componentName: "SelectBox",
      displayName: props.metaVertex.P.displayName,
      name: props.metaVertex.P.name,
      renderLabel: RenderLabel,
    },
  } as unknown as Vertex;

  const SelectThankYouPage = () => {
    return (
      <DynamicComponent
        componentName={"SelectBox"}
        data={props.selectedLayout}
        isRealTime={false}
        meta={meta}
        noPermissionCheck={true}
        txnId={layoutStore.formData.txnId}
      />
    );
  };

  const AddNewPageButton = () => {
    const handleAddNewClick = () => {
      window.open(`/admin/ThankYouPage/new`, "_blank");
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
      class={`${props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        {/* Show Page After Submission Form */}
        <Label metaVertex={props.metaVertex} />
      </span>
      <div class="flex f:15 flex:1" ref={buttonRef!}>
        <SelectThankYouPage />
        <AddNewPageButton />

      </div>
    </div>
  );
}
