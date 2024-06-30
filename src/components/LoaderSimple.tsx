import "~/css/modal.css";

export function LoaderNew(props: Readonly<{ class?: string; loaderHeight?: string }>) {
  return (
    <div
      style={`height:${
        props.loaderHeight ?? "100vh"
      };place-content:center;display:grid;`}
    >
      <div class={`${props.class ?? ""} loader`} />
    </div>
  );
}
