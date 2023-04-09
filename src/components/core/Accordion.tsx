import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Accordion, {Properties} from "devextreme/ui/accordion";
import {newVertex} from "./utils";
// @ts-ignore
import {accordionItems} from "../data/accordionItems";

export function AccordionComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: {  },
  });

  const data = newVertex(0, ["Vertex"], { meta: accordionItems });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <AccordionField meta={meta} data={data} setValue={setValue} />
}
export function AccordionField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Accordion(el, {
            animationDuration: 300,
            collapsible: true,
            multiple: false,
            selectedItems: [props.data.properties[props.meta.properties.id][0]],

            itemTitleTemplate: (itemData: any, itemIndex: number, itemElement: any) => {
              itemElement.innerHTML = `
                ${itemData.CompanyName}
              `;
              itemElement.style.height = "40px";
            },
            itemTemplate: (itemData: any, itemIndex: number, itemElement: any) => {
              itemElement.innerHTML = `
                <h3>${itemData.CompanyName}</h3>
                <p>${itemData.City}</p>
                <p>${itemData.Address}</p>
                <p>${itemData.City}</p>
                <p>${itemData.State}</p>
                <p>${itemData.Zipcode}</p>
                <p> ${itemData.Phone}</p>
              `;
            },
            onSelectionChanged: (e: any) => {
              props.setValue(props.meta, e.addedItems[0]);
            },
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