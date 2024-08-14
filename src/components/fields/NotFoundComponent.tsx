export function NotFoundComponent(props: { componentName: string }) {
  return (
    <div
      class={"text-red-500"}
    >{`${props.componentName ?? "Component"} Not implemented`}</div>
  );
}
