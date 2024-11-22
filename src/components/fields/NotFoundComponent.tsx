export function NotFoundComponent(props: { componentName: string }) {
  return (
    <div
      class={"c:red-50"}
    >{`${props.componentName ?? "Component"} Not implemented`}</div>
  );
}
