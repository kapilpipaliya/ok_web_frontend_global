import type { SetStoreFunction } from "solid-js/store";

import { domToPng } from "modern-screenshot";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { API } from "~/lib/api/endpoints";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { uploadFile } from "~/lib/api/uploadFile";
import { evalExpression } from "~/lib/expression_eval";
import { getToEdge } from "~/lib/graph/get/sync/edge/getToEdge";
import { addNewEdge, newEdge } from "~/lib/graph/mutate/core/edge";
import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";

import { setGraphData } from "../graph/mutate/core/setGraphData";

export async function capturePreview(
  formStoreVertex: () => Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
) {
  // Store the current selectedId
  const currentSelectedId = formStoreVertex().P.selectedId;

  try {
    // Temporarily remove the selectedId
    if (currentSelectedId !== undefined) {
      mergeVertexProperties<FormStoreObject>(
        0,
        formStoreVertex().id,
        graph,
        setGraph,
        {
          selectedId: -1,
        },
      );
    }

    // Wait a small moment for the UI to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get the iframe for this form
    const iframe = document.querySelector(
      `iframe[name="${formStoreVertex().id}"]`,
    ) as HTMLIFrameElement;

    if (!iframe) {
      throw new Error("Iframe not found");
    }

    // Capture screenshot
    const dataUrl = await domToPng(iframe.contentDocument!.body);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], "preview.png", { type: "image/png" });

    const imgSaveTxnId = generateNewTxnId(graph, setGraph);
    const existingPreview =
      evalExpression("->$0Preview", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[formStoreVertex().P.formDataId!]!],
      }) || [];

    let previewData;
    if (existingPreview.length > 0) {
      // Update existing preview
      const preview = existingPreview[existingPreview.length - 1];
      previewData = await uploadFile(
        file,
        `${API.file.replaceFileUrl}?fileId=${preview.id}`,
        "PUT",
      );
      if (previewData?.graph) {
        setGraphData(graph, setGraph, previewData.graph);
      }
    } else {
      // Create new preview
      previewData = await uploadFile(file, API.file.uploadFileUrl);
      if (previewData?.graph) {
        setGraphData(graph, setGraph, previewData.graph);
      }

      if (previewData?.result) {
        const previewVertexId =
          previewData.result[previewData.result.length - 1].id;
        const previewEdge = newEdge(
          generateNewVertexId(graph, setGraph),
          getToEdge(
            { P: { key: "Preview" } } as unknown as Vertex,
            graph.vertexes[formStoreVertex().P.formDataId!],
          ),
          {},
          formStoreVertex().P.formDataId,
          previewVertexId,
        );

        const addNewEdgeResult = addNewEdge(
          imgSaveTxnId,
          previewEdge,
          graph,
          setGraph,
        );

        if (addNewEdgeResult.error) {
          throw new Error(addNewEdgeResult.error as string);
        }

        const data = commitTxn(imgSaveTxnId, graph);
        if (data) {
          submitDataCall(data, graph, setGraph, imgSaveTxnId);
        }
      }
    }

    if (!previewData?.result) {
      throw new Error("Failed to capture preview");
    }

    return true;
  } catch (error) {
    console.error("Failed to capture preview:", error);
    showErrorToast(
      error instanceof Error ? error.message : "Failed to capture preview",
    );
    return false;
  } finally {
    // Restore the selectedId
    if (currentSelectedId !== undefined) {
      mergeVertexProperties<FormStoreObject>(
        0,
        formStoreVertex().id,
        graph,
        setGraph,
        {
          selectedId: currentSelectedId,
        },
      );
    }
  }
}
