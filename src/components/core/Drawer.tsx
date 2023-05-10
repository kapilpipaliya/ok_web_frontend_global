import { createEffect, createSignal, For, JSXElement, on, onMount, Show } from "solid-js";
import Drawer, { Properties } from "devextreme/ui/drawer";
import { ComponentProps } from "./Form";

export function DrawerComponent(
  props: ComponentProps & { children: JSXElement } & {
    isSideBarOpen: any;
    setSideBarOpen: any;
    template: any;
  },
) {
  const { isSideBarOpen, setSideBarOpen } = props;

  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          onMount(() => {
            const instance = new Drawer(el, {
              onOptionChanged(e) {
                if (e.name === "opened" && e.value === false) {
                  setSideBarOpen(false);
                }
              },
              template: props.template,
            });
            createEffect(on(isSideBarOpen, (_) => (isSideBarOpen() ? instance.show() : instance.hide())));

            createEffect(() => {
              for (const property in props.meta.properties.props as Properties) {
                instance.option(property, props.meta.properties.props[property]);
              }
            });
          });
        }}
      >
        <div id="content" class="dx-theme-background-color">
          {props.children}
        </div>
      </div>

    </div>
  );
}
