import type { ContextType } from "~/cypher/types/ContextType";

export function getLabelFilterSkipLimit(label: string, context: ContextType) {
  const nameMatch = label.match(/\[(.*?)\]/);
  let key = "";
  let filter = {};
  let limit = 0;
  let skip = 0;
  if (nameMatch) {
    key = nameMatch[1];
    label = label.replace(`[${key}]`, "");
    if (key.startsWith("$")) {
      const contextData = context[key as keyof ContextType] ?? {};
      filter = contextData.filter;
      limit = contextData.limit;
      skip = contextData.skip;
    } else {
      filter = { key: key };
    }
  }
  return { filter, label, limit, skip };
}
