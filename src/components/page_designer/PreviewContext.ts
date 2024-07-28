import { createContext, useContext } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";


export const PreviewContext = createContext<{previewData?: Vertex, previewMeta?: Vertex}>({});


export const usePreviewContext = () => useContext(PreviewContext);
