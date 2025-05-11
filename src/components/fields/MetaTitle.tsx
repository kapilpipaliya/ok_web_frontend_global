import { Title } from "@solidjs/meta";

import { getTitle } from "~/lib/graph/get/sync/theme/getTitle";

import { useGraph } from "~/lib/graph/context/UseGraph";

export function MetaTitle(props: { text: string }) {
  const [graph] = useGraph();
  return <Title>{getTitle(props.text || "", graph)}</Title>;
}
