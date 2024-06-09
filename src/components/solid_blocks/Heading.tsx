import { type JSX, splitProps } from "solid-js";

const Heading = (
  props: JSX.IntrinsicAttributes &
    JSX.HTMLAttributes<HTMLDivElement> & {
      etc: any;
      heading?: string;
      subheading?: string;
      divider?: boolean;
    },
) => {
  const [local, customProps] = splitProps(props, [
    "heading",
    "subheading",
    "divider",
  ]);

  return (
    <div class={`flex mt:5 mb:5 ai:center jc:start flex:col ${props.etc}`}>
      <h1 class="font:17 font-weight:bold mr:auto">
        {local.heading || "Default Heading"}
      </h1>
      {local.subheading && (
        <p class="text-base f:13 color:lightgrey mr:auto">{local.subheading}</p>
      )}
      {local.divider !== false && (
        <hr class="mt:2 mb:2 h:0.5 color:lightgrey w:full" />
      )}
    </div>
  );
};

export default Heading;
