import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import TreeList, {Properties} from "devextreme/ui/tree_list";
import {newVertex} from "./utils";

const treeListData = [
  {
    "id": 1,
    "parentId": 0,
    "fullName": "John Heart",
    "position": "CEO",
    "email": "jheart@dx-email.com"
  },
  {
    "id": 2,
    "parentId": 1,
    "fullName": "Samantha Bright",
    "position": "COO",
    "email": "samanthab@dx-email.com"
  },
  {
    "id": 3,
    "parentId": 1,
    "fullName": "Arthur Miller",
    "position": "CTO",
    "email": "arthurm@dx-email.com"
  },
  {
    "id": 4,
    "parentId": 1,
    "fullName": "Robert Reagan",
    "position": "CMO",
    "email": "robertr@dx-email.com"
  },
  {
    "id": 5,
    "parentId": 2,
    "fullName": "Greta Sims",
    "position": "HR Manager",
    "email": "gretas@dx-email.com"
  }
]

export function TreeListComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: treeListData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <TreeListField meta={meta} data={data} setValue={setValue} />
}
export function TreeListField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new TreeList(el, {
            showRowLines: true,
            autoExpandAll: true,
            columns: [
              "position",
              "fullName",
              "email"
            ],
            searchPanel: {
              visible: true,
              width: 250,
            },
            headerFilter: {
              visible: true,
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