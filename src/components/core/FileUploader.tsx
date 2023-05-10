import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import FileUploader, { Properties } from "devextreme/ui/file_uploader";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function FileUploaderComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: "" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <FileUploaderField meta={meta} data={data} setValue={setValue} />;
}
export function FileUploaderField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new FileUploader(el, {
            selectButtonText: "Select file",
            labelText: "",
            accept: "image/*",
            uploadMode: "instantly",
            onValueChanged: (e) => {
              props.setValue(props.meta, e.component._files[0].value);
            },
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      />

    </div>
  );
}
