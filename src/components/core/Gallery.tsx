import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Gallery, {Properties} from "devextreme/ui/gallery";
import {newVertex} from "./utils";

const galleryData = [
  "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person2.png",
  "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person1.png",
  "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person3.png",
  "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person4.png"
]

export function GalleryComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: galleryData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <GalleryField meta={meta} data={data} setValue={setValue} />
}
export function GalleryField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Gallery(el, {
            height: 400,
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