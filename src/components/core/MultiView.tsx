import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import MultiView, {Properties} from "devextreme/ui/multi_view";
import {newVertex} from "./utils";

const multiViewItems = [{
  ID: 1,
  CompanyName: 'SuprMart',
  Address: '702 SW 8th Street',
  City: 'Bentonville',
  State: 'Arkansas',
  Zipcode: 72716,
  Phone: '(800) 555-2797',
  Fax: '(800) 555-2171',
  Website: 'http://www.nowebsitesupermart.com',
}, {
  ID: 2,
  CompanyName: "El'Depot",
  Address: '2455 Paces Ferry Road NW',
  City: 'Atlanta',
  State: 'Georgia',
  Zipcode: 30339,
  Phone: '(800) 595-3232',
  Fax: '(800) 595-3231',
  Website: 'http://www.nowebsitedepot.com',
}, {
  ID: 3,
  CompanyName: 'K&S Music',
  Address: '1000 Nicllet Mall',
  City: 'Minneapolis',
  State: 'Minnesota',
  Zipcode: 55403,
  Phone: '(612) 304-6073',
  Fax: '(612) 304-6074',
  Website: 'http://www.nowebsitemusic.com',
}, {
  ID: 4,
  CompanyName: 'Tom Club',
  Address: '999 Lake Drive',
  City: 'Issaquah',
  State: 'Washington',
  Zipcode: 98027,
  Phone: '(800) 955-2292',
  Fax: '(800) 955-2293',
  Website: 'http://www.nowebsitetomsclub.com',
}];


export function MultiViewComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: multiViewItems });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <MultiViewField meta={meta} data={data} setValue={setValue} />
}
export function MultiViewField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new MultiView(el, {

            onItemClick: (e: any) => {
              props.setValue(props.meta, e.itemData);
            },
            height: 300,
            selectedIndex: 0,
            loop: false,
            animationEnabled: true,
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
            onSelectionChanged(e) {
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