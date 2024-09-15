export function DialogHeader(props: { title: string; }) {
  return <h3 class="lh:1.5rem color:gray-90 f:1rem  font:bold leading:1.5rem">
    {props.title}
  </h3>;
}
