import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { cssStateToString } from "~/features/css_editor/utils/cssStateToString";

export function getMetaProps(
  meta: Record<string, unknown>,
  ignoreKeys: string[],
  graph: GraphInterface,
): Record<string, unknown> {
  try {
    const result = {} as Record<string, unknown>;

    for (const key in meta) {
      if (ignoreKeys.includes(key)) {
        continue;
      }

      const value = meta[key];
      if (typeof value === "function") {
        result[key] = value;
      } else if (key.toLowerCase().endsWith("class")) {
        result[key] = cssStateToString(
          value as string,
          { P: { key: key } } as unknown as Vertex,
          { P: meta } as unknown as Vertex,
          graph,
        );
      } else if (value !== null) {
        result[key] = value;
      }
    }
    return result;
  } catch (error) {
    console.error("Error in getMetaProps:", error);
    return {};
  }
}
