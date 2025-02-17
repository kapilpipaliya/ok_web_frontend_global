export function ComponentName(props: { componentName: string }) {
  return (
    <div
      class="font-size:0.875rem line-height:1.25rem margin-right:4px"
      title="Name"
    >
      {props.componentName}
    </div>
  );
}
