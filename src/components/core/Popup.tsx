import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Popup, {Properties} from "devextreme/ui/popup";
import {newVertex} from "./utils";

export function PopupComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: 'Some popup message' });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <PopupField meta={meta} data={data} setValue={setValue} />
}
export function PopupField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Popup(el, {
            visible: false,
            contentTemplate: () => {
              return "<div>Some popup message</div>"
            },
            width: 200,
            height: 200,
            showTitle: true,
            title: "Popup",
            dragEnabled: true,
            closeOnOutsideClick: true,
            showCloseButton: true,
            position: {
              at: 'bottom',
              my: 'center',
              collision: 'fit',
            },
            toolbarItems: [{
              locateInMenu: 'always',
              widget: 'dxButton',
              toolbar: 'top',
              options: {
                text: 'More info',
                onClick() {
                  console.log(`More info is clicked`)
                },
              },
            }, {
              widget: 'dxButton',
              toolbar: 'bottom',
              location: 'before',
              options: {
                icon: 'email',
                text: 'Send',
                onClick() {
                  console.log(`Email is sent to`)

                },
              },
            }, {
              widget: 'dxButton',
              toolbar: 'bottom',
              location: 'after',
              options: {
                text: 'Close',
                onClick() {
                  instance.hide();
                },
              },
            }],

          });

          createEffect(() =>
            instance.show()
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