import { useSearchParams } from "@solidjs/router";

import { getMemberVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { useGraph } from "~/lib/graph/graph";

export default function EmailTemplate() {
  const [searchParams] = useSearchParams();
  const [graph] = useGraph();

  return (
    <div>
      <h1>Email Template</h1>
      <div>
        {JSON.stringify(searchParams)}
      </div>
      <div>
        {JSON.stringify(getMemberVertex(graph))}
      </div>
    </div>
  );
} 