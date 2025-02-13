export function NotFoundComponent(props: { componentName: string }) {
  return (
    <div
      class={"c:error"}
    >{`${props.componentName ?? "Component"} Not implemented`}</div>
  );
}
