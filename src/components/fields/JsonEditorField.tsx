import { JSX, splitProps, onCleanup, onMount } from "solid-js";
import { clientOnly } from "@solidjs/start";

export function JsonEditorField(props: { json: any, onChange: (updatedContent: any) => void } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, divProps] = splitProps(props, ["json", "onChange"]);
  let containerRef: HTMLDivElement | undefined;

  const handleOnChange = (updatedContent: any) => {
    local.onChange(updatedContent);
  };

  onMount(async () => {
    const ReactJsonView = await import('@microlink/react-json-view');
    if (containerRef) {
      const { createRoot } = await import('react-dom/client');
      const React = await import('react');
      const ReactJsonViewComponent = ReactJsonView.default;

      const root = createRoot(containerRef);
      root.render(
        React.createElement(ReactJsonViewComponent, {
          src: local.json,
          onEdit: (edit: any) => handleOnChange(JSON.stringify(edit.updated_src)),
          onAdd: (add: any) => handleOnChange(JSON.stringify(add.updated_src)),
          onDelete: (del: any) => handleOnChange(JSON.stringify(del.updated_src)),
        })
      );
    }
  });

  onCleanup(() => {
    if (containerRef) {
      // containerRef.innerHTML = '';
    }
  });

  return (
    <div {...divProps} style={{ height: "400px" }} ref={el => containerRef = el}>
    </div>
  );
}
