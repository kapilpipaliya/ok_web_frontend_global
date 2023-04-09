import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import FileManager, {Properties} from "devextreme/ui/file_manager";
import {newVertex} from "./utils";

const fileManagerData = [
    {
      name: "Documents",
      isDirectory: true,
      items: [
        {
          name: "Projects",
          isDirectory: true,
          items: [
            {
              name: "About.rtf",
              isDirectory: false
            },
            {
              name: "Passwords.rtf",
              isDirectory: false
            }
          ]
        },
        {
          name: "About.xml",
          isDirectory: false
        },
        {
          name: "Managers.rtf",
          isDirectory: false
        },
        {
          name: "ToDo.txt",
          isDirectory: false
        }
      ]
    },
    {
      name: "Images",
      isDirectory: true,
      items: [
        {
          name: "logo.png",
          isDirectory: false
        },
        {
          name: "banner.gif",
          isDirectory: false
        }
      ]
    },
    {
      name: "System",
      isDirectory: true,
      items: [
        {
          name: "Employees.txt",
          isDirectory: false
        },
        {
          name: "PasswordList.txt",
          isDirectory: false
        }
      ]
    },
    {
      name: "Description.rtf",
      isDirectory: false
    },
    {
      name: "Description.txt",
      isDirectory: false
    }
  ]

export function FileManagerComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: fileManagerData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <FileManagerField meta={meta} data={data} setValue={setValue} />
}
export function FileManagerField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new FileManager(el, {
            fileSystemProvider: props.data.properties[props.meta.properties.id],
            itemView: {
              mode: "thumbnails"
            },
            permissions: {
              create: true,
              copy: true,
              move: true,
              rename: true
            }
          });

          createEffect(() =>
            instance.option(
              "fileSystemProvider",
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