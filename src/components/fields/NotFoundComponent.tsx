export function NotFoundComponent(props: { componentName: string }) {
  return (
    <div
      class={"fg:error"}
    >{`${props.componentName ?? "Component"} Not implemented`}</div>
  );
}
