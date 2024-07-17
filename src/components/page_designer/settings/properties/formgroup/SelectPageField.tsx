import type { Accessor } from "solid-js";

import { Icon } from "@iconify-icon/solid";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { IdAttr, type Vertex } from "~/lib/graph/graph";

import { Label } from "./Label";

export function SelectPageField(
  props: Readonly<{
    meta: Accessor<Vertex>;
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
        <button
          class="center-content flex"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`/admin/ThankYouPage/${option.id}`, "_blank");
          }}
        >
          <Icon
            class={"cursor:pointer opacity:.5 opacity:1:hover"}
            height={22}
            icon={"mingcute:settings-5-line"}
            width={22}
          />
        </button>

      </div>
    );
  };

  const meta = {
    P: {
      class: "flex:1",
      collection:  `g:'ThankYouPage'`,
      component: "SelectBox",
      displayName: props.metaVertex.P.displayName,
      name: props.metaVertex.P.name,
      renderLabel: RenderLabel,
    },
  } as unknown as Vertex;

  const SelectThankYouPage = () => {
    return (
      <DynamicComponent
        component={"SelectBox"}
        data={props.selectedLayout}
        isRealTime={false}
        meta={meta}
        txnId={layoutStore.formData.txnId}
      />
    );
  };

  const AddNewPageButton = () => {
    const handleAddNewClick = () => {
      window.open(`/admin/ThankYouPage/new`, "_blank");
    };
    return (
      <>
        <button onClick={handleAddNewClick} title="Add New Rule">
          <Icon height={21} icon="ic:round-add" width={21} />
        </button>
      </>
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
