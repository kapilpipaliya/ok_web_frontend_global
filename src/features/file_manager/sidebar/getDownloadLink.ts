import { API } from "~/lib/api/endpoints";
import type { Vertex } from "~/lib/graph/type/vertex";

export const getDownloadLink = (metaVertex?: Vertex) => {
  if (!metaVertex) {
    return "";
  }
  return `${API.file.downloadFileUrl}?fileName=${metaVertex.P.fileName}`;
};

export const openInNewTab = (url: string) => {
  window.open(url, "_blank");
};
