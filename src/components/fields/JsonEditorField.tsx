import {
  createEffect,
  type JSX,
  on,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";

export function JsonEditorField(
  props: {
    json: any;
    onChange: (updatedContent: any) => void;
  } & JSX.HTMLAttributes<HTMLDivElement>,
) {
  const [local, divProps] = splitProps(props, ["json", "onChange"]);
  let containerRef: HTMLDivElement | undefined;
  let root: any;

  const handleOnChange = (updatedContent: any) => {
    local.onChange(updatedContent);
  };

  const renderReactComponent = async () => {
    const ReactJsonView = await import("@microlink/react-json-view");
    if (containerRef) {
      // @ts-ignore
      const { createRoot } = await import("react-dom/client");
      // @ts-ignore
      const React = await import("react");
      const ReactJsonViewComponent = ReactJsonView.default;

      if (!root) {
        root = createRoot(containerRef);
      }
      root.render(
        React.createElement(ReactJsonViewComponent, {
          onAdd: (add: any) => handleOnChange(JSON.stringify(add.updated_src)),
          onDelete: (del: any) =>
            handleOnChange(JSON.stringify(del.updated_src)),
          onEdit: (edit: any) =>
            handleOnChange(JSON.stringify(edit.updated_src)),
          src: local.json,
        }),
      );
    }
  };

  onMount(() => {
    renderReactComponent();
  });

  createEffect(
    on(
      () => JSON.parse(JSON.stringify(local.json)),
      () => {
        renderReactComponent();
      },
      { defer: true },
    ),
  );

  onCleanup(() => {
    if (containerRef) {
      // containerRef.innerHTML = '';
    }
  });

  return (
    <div
      {...divProps}
      class="h:200px overflow:auto"
      ref={(el) => (containerRef = el)}
    ></div>
  );
}
