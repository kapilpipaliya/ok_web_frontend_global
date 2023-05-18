import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import Bullet, { Properties } from "devextreme/viz/bullet";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function BulletComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: { color: "#a9c387" },
  });

  const data = newVertex(0, ["Vertex"], { meta: 40 });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <BulletField meta={meta} data={data} setValue={setValue} />;
}
export function BulletField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new Bullet(el, {
            target: 30,
            value: props.data.properties[props.meta.properties[IdAttr]],
          });
          createEffect(() => instance.option("value", props.data.properties[props.meta.properties[IdAttr]]));
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
