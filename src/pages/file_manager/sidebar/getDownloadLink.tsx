import type { Vertex } from "~/lib/graph/graph";

export const getDownloadLink = (metaVertex: Vertex) => `/api/file/download?fileId=${metaVertex.id}`;export const openInNewTab = (url: string) => {
  window.open(url, "_blank");
};

