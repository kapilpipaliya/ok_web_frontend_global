import "~/css/modal.css";

export function LoaderNew(props: { class?: string }) {
  return (
    <div style={"height:100vh;place-content:center;display:grid;"}>
      <div class={`${props.class ?? ""} loader`} />
    </div>
  );
}
