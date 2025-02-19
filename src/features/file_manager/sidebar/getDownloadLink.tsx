import type { Vertex } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";

export const getDownloadLink = (metaVertex?: Vertex) => {
  if (!metaVertex) {
    return "";
  }
  return `${API.file.downloadFileUrl}?fileId=${metaVertex.id}`;
};

export const openInNewTab = (url: string) => {
  window.open(url, "_blank");
};
