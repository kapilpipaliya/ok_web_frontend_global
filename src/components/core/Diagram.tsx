import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Diagram, {Properties} from "devextreme/ui/diagram";
import {newVertex} from "./utils";

const diagramData = [
  {
    "id": "125",
    "from": "101",
    "to": "102"
  },
  {
    "id": "127",
    "from": "101",
    "to": "103"
  },
  {
    "id": "129",
    "from": "103",
    "to": "104"
  },
  {
    "id": "130",
    "from": "103",
    "to": "105"
  },
  {
    "id": "139",
    "from": "102",
    "to": "106"
  },
  {
    "id": "140",
    "from": "102",
    "to": "107"
  }
]

export function DiagramComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: diagramData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <DiagramField meta={meta} data={data} setValue={setValue} />
}
export function DiagramField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Diagram(el, {
            // height: 660,
            // propertiesPanel: {
            //   enabled: false
            // },
            // simpleView: true,
            // toolbox: {
            //   visible: false
            // },
            // width: 500
          });



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