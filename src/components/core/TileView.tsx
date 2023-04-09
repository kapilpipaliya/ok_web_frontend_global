import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import TileView, {Properties} from "devextreme/ui/tile_view";
import {newVertex} from "./utils";

const tileViewData = [
    {
      "ID": "1",
      "Address": "652 Avonwick Gate",
      "City": "Toronto",
      "State": "ON",
      "Price": 780000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/1.jpg"
    },
    {
      "ID": "2",
      "Address": "328 S Kerema Ave",
      "City": "Milford",
      "State": "CT",
      "Price": 350000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/3.jpg"
    },
    {
      "ID": "3",
      "Address": "8512 Tanglewood Cir",
      "City": "Reform",
      "State": "AL",
      "Price": 250000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/6.jpg",
      "widthRatio": 2
    },
    {
      "ID": "4",
      "Address": "6351 Forrest St",
      "City": "Jersey City",
      "State": "NJ",
      "Price": 320000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/14.jpg"
    },
    {
      "ID": "5",
      "Address": "61207 16th St N",
      "City": "Moorhead",
      "State": "MN",
      "Price": 1700000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/5.jpg",
      "heightRatio": 2,
      "widthRatio": 2
    },
    {
      "ID": "6",
      "Address": "5119 Beryl Dr",
      "City": "San Antonio",
      "State": "TX",
      "Price": 455000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/4.jpg"
    },
    {
      "ID": "7",
      "Address": "7121 Bailey St",
      "City": "Worcester",
      "State": "MA",
      "Price": 555000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/7.jpg"
    },
    {
      "ID": "8",
      "Address": "82649 Topeka St",
      "City": "Riverbank",
      "State": "CA",
      "Price": 1750000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/2.jpg",
      "heightRatio": 2
    },
    {
      "ID": "9",
      "Address": "7700 Elmwood Dr",
      "City": "Cleveland",
      "State": "OK",
      "Price": 470000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/17.jpg",
      "heightRatio": 2,
      "widthRatio": 2
    },
    {
      "ID": "10",
      "Address": "620201 Plymouth Rd",
      "City": "Detroit",
      "State": "MI",
      "Price": 610000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/8.jpg"
    },
    {
      "ID": "11",
      "Address": "1198 Theresa Cir",
      "City": "Whitinsville",
      "State": "MA",
      "Price": 320000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/9.jpg"
    },
    {
      "ID": "12",
      "Address": "4815 Warbler Ln",
      "City": "Rockport",
      "State": "TX",
      "Price": 700000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/12.jpg"
    },
    {
      "ID": "13",
      "Address": "420234 Rogge St",
      "City": "Detroit",
      "State": "MI",
      "Price": 320000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/23.jpg"
    },
    {
      "ID": "14",
      "Address": "114840 Interlake Ave N",
      "City": "Seattle",
      "State": "WA",
      "Price": 400000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/22.jpg"
    },
    {
      "ID": "15",
      "Address": "13673 Pearl Dr #7",
      "City": "Monroe",
      "State": "MI",
      "Price": 399000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/20.jpg"
    },
    {
      "ID": "16",
      "Address": "15447 Via Viento",
      "City": "Atascadero",
      "State": "CA",
      "Price": 1100000,
      "ImageSrc": "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/21.jpg"
    }
  ]

export function TileViewComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: tileViewData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <TileViewField meta={meta} data={data} setValue={setValue} />
}
export function TileViewField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new TileView(el, {
            height: 350,
            itemTemplate: (itemData, itemIndex, itemElement) => {
              console.log("itemData", itemData, itemElement)
              const imageDiv = <div></div>;
              imageDiv.style.backgroundImage = "url(" + itemData.ImageSrc + ")";
              imageDiv.style.height = "100%";
              imageDiv.style.width = "100%";
              imageDiv.style.backgroundPosition = "center";
              imageDiv.style.backgroundSize = "cover";
              imageDiv.style.display = "block";
              itemElement.append(imageDiv);
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