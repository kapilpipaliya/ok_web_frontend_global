import "~/css/modal.css";

export function LoaderNew(
  props: Readonly<{ class?: string; loaderHeight?: string }>,
) {
  return (
    <div
      class={`display:grid height:${props.loaderHeight ?? "100vh"} place-content:center`}
    >
      <div class={`loader ${props.class ?? ""}`} />
    </div>
  );
}
