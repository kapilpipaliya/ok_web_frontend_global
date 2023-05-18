import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import Popup, { Properties } from "devextreme/ui/popup";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function PopupComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: "Some popup message" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <PopupField meta={meta} data={data} setValue={setValue} />;
}
export function PopupField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new Popup(el, {
            visible: false,
            contentTemplate: () => {
              return "<div>Some popup message</div>";
            },
            width: 200,
            height: 200,
            showTitle: true,
            title: "Popup",
            dragEnabled: true,
            closeOnOutsideClick: true,
            showCloseButton: true,
            position: {
              at: "bottom",
              my: "center",
              collision: "fit",
            },
            toolbarItems: [
              {
                locateInMenu: "always",
                widget: "dxButton",
                toolbar: "top",
                options: {
                  text: "More info",
                  onClick() {
                    console.log(`More info is clicked`);
                  },
                },
              },
              {
                widget: "dxButton",
                toolbar: "bottom",
                location: "before",
                options: {
                  icon: "email",
                  text: "Send",
                  onClick() {
                    console.log(`Email is sent to`);
                  },
                },
              },
              {
                widget: "dxButton",
                toolbar: "bottom",
                location: "after",
                options: {
                  text: "Close",
                  onClick() {
                    instance.hide();
                  },
                },
              },
            ],
          });

          createEffect(() => instance.show());
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
