import type { Vertex } from "~/lib/graph/graph";

export function getPageTitle(formMeta?: Vertex): string {
  return `${formMeta?.P?.seoTitle || formMeta?.P?.key || `New ${formMeta?.L[0] ?? "Form"} Builder`}`;
}
