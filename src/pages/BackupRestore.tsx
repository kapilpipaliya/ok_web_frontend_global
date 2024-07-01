import type { JSX } from "solid-js";

import { A } from "@solidjs/router";

import { APP_BASE_URL } from "~/lib/constants";

export function BackupRestore() {
  const C = (props: Readonly<{
    children: JSX.Element;
    subtitle: string;
    title: string;
  }>) => {
    return (
      <div class="b:2">
        <div class="p:10 bb:1">
          <h2 class="uk-margin-remove-bottom">{props.title}</h2>
          <span>{props.subtitle}</span>
        </div>
        <div class="m:0 p:12">{props.children}</div>
      </div>
    );
  };

  return (
    <div class="mb:1.5rem mt:10 m:6">
      <div class="grid-cols:2 grid-cols:3@xs grid-cols:3@sm grid-cols:3@md grid-cols:3@lg grid-cols:3@xl gap:10 w:full text:center">
        <C subtitle={"Simple Import"} title={"Links"}>
          <div class="m:0 p:12">
            <div class="m:1rem flex gap:0.5rem">
              <A
                class="b:2|solid|blue-40"
                href={`${APP_BASE_URL}/SimpleImport`}
              >
                Go to Simple Import
              </A>

              <A class="b:2|solid|blue-40" href={`${APP_BASE_URL}/Nav`}>
                Configure Navigation
              </A>
            </div>
          </div>
        </C>
      </div>
    </div>

  );
}
