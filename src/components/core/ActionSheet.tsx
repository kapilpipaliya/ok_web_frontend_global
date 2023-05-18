import { createEffect, createSignal, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import ActionSheet, { Properties } from "devextreme/ui/action_sheet";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const actionSheetItems = [{ text: "Call" }, { text: "Send message" }, { text: "Edit" }, { text: "Delete" }];
export function ActionSheetComponent() {
  const [buttonClicked, setButtonClicked] = createSignal(false);
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: { visible: true },
  });

  const data = newVertex(0, ["Vertex"], { meta: actionSheetItems });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return (
    <>
      <button
        onClick={() => {
          setButtonClicked(!buttonClicked());
          console.log(buttonClicked());
        }}
      >
        Show Action Sheet
      </button>
      {buttonClicked() && <ActionSheetField meta={meta} data={data} setValue={setValue} />}
    </>
  );
}
export function ActionSheetField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new ActionSheet(el, {
            title: "Choose action",
            onCancelClick: () => {
              props.setValue(props.meta, "Cancel");
            },
            onItemClick: (e: any) => {
              props.setValue(props.meta, e.itemData.text);
            },
          });
          createEffect(() => instance.option("dataSource", props.data.properties[props.meta.properties[IdAttr]]));
          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
          onCleanup(() => instance.dispose());
        }}
      />


  );
}
