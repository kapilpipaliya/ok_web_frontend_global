import { Icon } from "@iconify-icon/solid";
import { createMemo, Match, Switch } from "solid-js";

import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import {
  arkUIComponents,
  corvuComponents,
  kobalteComponents,
} from "../form/functions/getDynamicComponent";

export function OpenComponentURL(
  props: Readonly<{ class?: string; meta: Vertex }>,
) {
  const [graph] = useGraph();
  const componentKey = () => props.meta.P.key.split(".")[0];
  const componentVertex = () =>
    findVertexByLabelAndUniqueId(graph, "Comp", "key", componentKey());

  const componentUrl = createMemo(() => {
    if (kobalteComponents[componentKey() as keyof typeof kobalteComponents]) {
      return `https://kobalte.dev/docs/core/components/${componentVertex()?.P.info}`;
    }
    if (corvuComponents[componentKey() as keyof typeof corvuComponents]) {
      return `https://corvu.dev/docs/primitives/${componentVertex()?.P.info}/`;
    }
    if (arkUIComponents[componentKey() as keyof typeof arkUIComponents]) {
      return `https://ark-ui.com/solid/docs/components/${componentVertex()?.P.info}`;
    }
    return null;
  });

  return (
    <Switch>
      <Match when={componentUrl() !== null}>
        <a
          class={`${props.class ?? ""}`}
          href={componentUrl()!}
          rel="noreferrer"
          target="_blank"
        >
          <Icon height={21} icon={"ci:external-link"} width={21} />
        </a>
      </Match>
    </Switch>
  );
}
