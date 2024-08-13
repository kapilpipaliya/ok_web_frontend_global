import type { ContextType } from "~/cypher/types/ContextType";

export function getLabelFilterSkipLimit(label: string, context: ContextType) {
  const nameMatch = label.match(/\[(.*?)\]/);
  let name = "";
  let filter = {};
  let limit = 0;
  let skip = 0;
  if (nameMatch) {
    name = nameMatch[1];
    label = label.replace(`[${name}]`, "");
    if (name.startsWith("$")) {
      const contextData = context[name as keyof ContextType] ?? {};
      filter = contextData.filter;
      limit = contextData.limit;
      skip = contextData.skip;
    } else {
      filter = { name: name };
    }
  }
  return { filter, label, limit, skip };
}
