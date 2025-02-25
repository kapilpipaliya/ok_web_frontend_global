import { Title } from "@solidjs/meta";

import { getTitle } from "~/components/getTitle";
import { useGraph } from "~/lib/graph/graph";

export function MetaTitle(props: { text: string }) {
  const [graph] = useGraph();
  return <Title>{getTitle(props.text || "", graph)}</Title>;
}
