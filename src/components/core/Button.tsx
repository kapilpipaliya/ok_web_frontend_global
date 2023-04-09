import {createEffect} from "solid-js";
import { DisplayComponentProps } from "./Form";
import Button, {Properties} from "devextreme/ui/button";
import {newVertex} from "./utils";

export function ButtonComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { stylingMode: "contained", width: "120", type: "success" },
  });

  const data = newVertex(0, ["Vertex"], { meta: 'Button' });

  return <ButtonField meta={meta} data={data} onClick={()=>0} />
}
export function ButtonField(props: DisplayComponentProps & {
 onClick: () => void;
}) {
  return (
      <div
        ref={(el) => {
          const instance = new Button(el, {
            text: props.data.properties[props.meta.properties.id],
            onClick: props.onClick
          });
          createEffect(() =>
            instance.option(
              "text",
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
  );
}