import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Scheduler, {Properties} from "devextreme/ui/scheduler";
import {newVertex} from "./utils";

export function SchedulerComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: [] });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <SchedulerField meta={meta} data={data} setValue={setValue} />
}
export function SchedulerField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Scheduler(el, {
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