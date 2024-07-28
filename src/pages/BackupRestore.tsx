import type { JSX } from "solid-js";

import { A } from "@solidjs/router";

import { useGraph } from "~/lib/graph/graph";



export function BackupRestore() {
  const [graph] = useGraph();
  const C = (
    props: Readonly<{
      children: JSX.Element;
      subtitle: string;
      title: string;
    }>,
  ) => {
    return (
      <div class="b:2">
        <div class="bb:1 p:10">
          <h2 class="uk-margin-remove-bottom">{props.title}</h2>
          <span>{props.subtitle}</span>
        </div>
        <div class="m:0 p:12">{props.children}</div>
      </div>
    );
  };

  return (
    <div class="m:6 mb:1.5rem mt:10">
      <div class="gap:10 grid-cols:2 grid-cols:3@xs grid-cols:3@sm grid-cols:3@md grid-cols:3@lg grid-cols:3@xl text:center w:full">
        <C subtitle={"Simple Import"} title={"Links"}>
          <div class="m:0 p:12">
            <div class="flex gap:0.5rem m:1rem">
              <A
                class="b:2|solid|blue-40"
                href={`${graph.APP_BASE_URL}/SimpleImport`}
              >
                Go to Simple Import
              </A>

              <A class="b:2|solid|blue-40" href={`${graph.APP_BASE_URL}/Nav`}>
                Configure Navigation
              </A>
            </div>
          </div>
        </C>
      </div>
    </div>
  );
}
