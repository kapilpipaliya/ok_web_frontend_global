import { type JSX, splitProps } from "solid-js";

export function Heading(
  props: {
    divider?: boolean;
    etc: any;
    heading?: string;
    subheading?: string;
  } & JSX.HTMLAttributes<HTMLDivElement> &
    JSX.IntrinsicAttributes,
) {
  const [local, customProps] = splitProps(props, [
    "heading",
    "subheading",
    "divider",
  ]);

  return (
    <div class={`${props.etc} flex ai:center flex:col jc:start mb:5 mt:5`}>
      <h1 class="font-weight:bold font:17 mr:auto">
        {local.heading || "Default Heading"}
      </h1>
      {local.subheading && (
        <p class="text-base color:lightgrey f:13 mr:auto">{local.subheading}</p>
      )}
      {local.divider !== false && (
        <hr class="color:lightgrey h:0.5 mb:2 mt:2 w:full" />
      )}
    </div>
  );
}
