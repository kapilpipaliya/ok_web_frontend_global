import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
  type PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { cloneLayoutAndChildren } from "~/features/page_designer/functions/layout/cloneLayoutAndChildren";
import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getPlatformModifierKeyLabel } from "~/lib/dom/getPlatformModifierKeyLabel";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { importGraphStructure } from "~/lib/graph/import/importGraphStructure";

interface PasteButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

function isClipboardPermissionError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "NotAllowedError" || error.name === "SecurityError")
  );
}

async function readClipboardText(): Promise<string> {
  if (!navigator.clipboard?.readText) {
    throw new DOMException(
      "Clipboard read is not supported in this browser",
      "NotSupportedError",
    );
  }
  return navigator.clipboard.readText();
}

export function PasteButton(props: Readonly<PasteButtonProps>) {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showWarningToast } = useToast();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const layoutStoreId = useDesignerLayoutStore();
  const layoutVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const copiedItem = () => layoutVertex().P.copiedItem;

  const pasteCopiedItem = (targetItem: Vertex) => {
    const item = copiedItem();
    if (!item) {
      showWarningToast("Nothing copied yet. Copy a component first.");
      return;
    }

    cloneLayoutAndChildren(
      item,
      targetItem,
      undefined,
      formStoreVertex()?.P.txnId,
      graph,
      setGraph,
      graph.vertexes[formStoreVertex()?.P.formDataId] || undefined,
    );
  };

  // Function to process clipboard data containing a graph
  const processClipboardGraph = async (targetItem: Vertex) => {
    try {
      const clipboardText = await readClipboardText();
      let clipboardData: GraphInterface;

      try {
        clipboardData = JSON.parse(clipboardText);
      } catch {
        showWarningToast("Clipboard does not contain a valid component graph.");
        return;
      }

      if (!(clipboardData.vertexes && clipboardData.edges)) {
        showWarningToast("Clipboard does not contain a valid component graph.");
        return;
      }

      const { metaTxnId, rootVertexIds } = importGraphStructure(
        clipboardData,
        graph,
        setGraph,
      );

      if (rootVertexIds.length > 0) {
        const rootVertex = graph.vertexes[rootVertexIds[0]];
        if (rootVertex) {
          cloneLayoutAndChildren(
            rootVertex,
            targetItem,
            undefined,
            formStoreVertex()?.P.txnId,
            graph,
            setGraph,
            graph.vertexes[formStoreVertex()?.P.formDataId] || undefined,
          );
        }
      }

      revertTransaction(metaTxnId, graph, setGraph);
    } catch (error) {
      if (isClipboardPermissionError(error)) {
        // Fall back to in-app copy when system clipboard read is blocked
        // (common in embedded browsers / denied clipboard-read permission).
        if (copiedItem()) {
          pasteCopiedItem(targetItem);
          showWarningToast(
            "Clipboard access denied. Pasted the last in-app copy instead.",
          );
          return;
        }

        showErrorToast(
          "Clipboard access denied. Allow clipboard permission, or copy in-app and click Paste without a modifier key.",
        );
        return;
      }

      console.error("Error processing clipboard graph:", error);
      showErrorToast("Failed to paste from clipboard.");
    }
  };

  return (
    <IconButton
      css={[
        ICON_BUTTON_STYLES.baseCss,
        ICON_BUTTON_STYLES.defaultCss,
        ...ensureArray(props.css),
        `return \`._id {
        background-color: transparent;
        border: none;
      }\`;`,
      ]}
      icon="ph:clipboard"
      onClick={(e) => {
        e.stopPropagation();

        if (e.ctrlKey || e.metaKey) {
          // Cmd/Ctrl+Click - Process clipboard graph
          void processClipboardGraph(props.item);
        } else {
          pasteCopiedItem(props.item);
        }
      }}
      size={props.size}
      title={`Paste (${getPlatformModifierKeyLabel()}+Click to paste from clipboard)`}
    />
  );
}
