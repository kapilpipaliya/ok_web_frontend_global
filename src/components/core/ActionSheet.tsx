import {createEffect, createSignal, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import ActionSheet, {Properties} from "devextreme/ui/action_sheet";
import {newVertex} from "./utils";

const actionSheetItems = [
  { text: 'Call' },
  { text: 'Send message' },
  { text: 'Edit' },
  { text: 'Delete' },
];
export function ActionSheetComponent() {
  const [buttonClicked, setButtonClicked] = createSignal(false);
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { visible: true },
  });

  const data = newVertex(0, ["Vertex"], { meta: actionSheetItems });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return (
    <>
      <button onClick={() => {
        setButtonClicked(!buttonClicked())
        console.log(buttonClicked())
      } }>Show Action Sheet</button>
      {buttonClicked() && <ActionSheetField meta={meta} data={data} setValue={setValue} />}

    </>
  )
}
export function ActionSheetField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new ActionSheet(el, {

            title: "Choose action",
            onCancelClick: () => {
              props.setValue(props.meta, "Cancel");
            },
            onItemClick: (e: any) => {
              props.setValue(props.meta, e.itemData.text);
            }
          });
          createEffect(() =>
            instance.option(
              "dataSource",
              props.data.properties[props.meta.properties.id]
            )
          );
          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      />
      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  );
}