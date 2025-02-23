import { domToPng } from "modern-screenshot";
import { createMemo } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { formSubmit } from "~/components/form/functions/formSubmit";
import { uploadFile } from "~/components/styled/FileUploader";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { evalExpression } from "~/lib/expression_eval";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewEdge } from "~/lib/graph/mutate/edge";
import { newEdge } from "~/lib/graph/mutate/edge";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { headerIconButtonClass } from "~/pages/constants/constant";

export function SaveIconButton(props: { formStoreId: string }) {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const txnId = () => formStoreVertex()?.P.txnId;

  const isDisabled = createMemo(
    () => !!txnId() && isDisabledTxn(txnId()!, graph),
  );

  const capturePreview = async (apiUrl: string, method = "POST") => {
    // Get the first opened view's iframe
    const iframe = document.querySelector(
      `iframe[name="${props.formStoreId}"]`,
    ) as HTMLIFrameElement;
    if (!iframe) {
      return;
    }

    try {
      // Wait for iframe to load
      // await new Promise(resolve => iframe.addEventListener('load', resolve, { once: true }));

      // Capture the iframe content using modern-screenshot
      const dataUrl = await domToPng(iframe.contentDocument!.body);

      // Convert data URL to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // Create file from blob
      const file = new File([blob], "preview.png", { type: "image/png" });

      const data = await uploadFile(file, apiUrl, method);
      if (data?.graph) {
        setGraphData(graph, setGraph, data.graph);
      }

      return data;
    } catch (error) {
      console.error("Failed to capture preview:", error);
      return null;
    }
  };

  const handleSave = async () => {
    // Call original form submit
    const formSubmitError = await formSubmit(
      formStoreVertex,
      graph,
      setGraph,
      () => {},
      showErrorToast,
      showLoadingToast,
      showWarningToast,
    )();

    if (formSubmitError) {
      return;
    }

    const imgSaveTxnId = generateNewTxnId(graph, setGraph);
    const existingPreview =
      evalExpression("->$0Preview", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[formStoreVertex().P.formDataId!]!],
      }) || [];

    if (existingPreview.length > 0) {
      const preview = existingPreview[existingPreview.length - 1];
      const previewData = await capturePreview(
        `${API.file.replaceFileUrl}?fileId=${preview.id}`,
        "PUT",
      );
      if (!previewData?.result) {
        showErrorToast("Failed to capture preview");
        return;
      }
      // const data = commitTxn(imgSaveTxnId, graph);
      // submitDataCall(data, graph, setGraph, imgSaveTxnId);
    } else {
      const previewData = await capturePreview(API.file.uploadFileUrl);
      if (!previewData?.result) {
        showErrorToast("Failed to capture preview");
        return;
      }
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
        showErrorToast(addNewEdgeResult.error as string);
        return;
      }
      const data = commitTxn(imgSaveTxnId, graph);
      if (data) {
        submitDataCall(data, graph, setGraph, imgSaveTxnId);
      }
    }
  };

  return (
    <IconButton
      class={`${isDisabled() ? "cursor:not-allowed" : ""} ${headerIconButtonClass}`}
      icon="ph:floppy-disk"
      onClick={handleSave}
      size={22}
      title="Save"
      tooltipGroup="page-buttons"
    />
  );
}
