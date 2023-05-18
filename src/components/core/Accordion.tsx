import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import Accordion, { Properties } from "devextreme/ui/accordion";
// @ts-ignore
import { accordionItems } from "../data/accordionItems";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function AccordionComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: accordionItems });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <AccordionField meta={meta} data={data} setValue={setValue} />;
}
export function AccordionField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new Accordion(el, {
            animationDuration: 300,
            collapsible: true,
            multiple: false,
            selectedItems: [props.data.properties[props.meta.properties[IdAttr]][0]],

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
