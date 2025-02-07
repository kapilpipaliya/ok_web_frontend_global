import { domToPng } from 'modern-screenshot';
import { createMemo } from "solid-js";

import type { FormStoreObject, } from "~/components/form/context/FormContext";

import { formSubmit } from "~/components/form/functions/formSubmit";
import { uploadFile } from "~/components/solid_blocks/FileUploader";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/Toast";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from '~/lib/graph/mutate/vertex';
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { headerIconButtonClass } from "~/pages/admin_layout/constant";

export function SaveIconButton(props: { formStoreId: string }) {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const formStoreVertex = () => graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const txnId = () => formStoreVertex()?.P.txnId;

  const isDisabled = createMemo(
    () => !!txnId() && isDisabledTxn(txnId()!, graph),
  );

  const capturePreview = async () => {
    // Get the first opened view's iframe
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe) return;

    try {
      // Wait for iframe to load
      // await new Promise(resolve => iframe.addEventListener('load', resolve, { once: true }));
      
      // Capture the iframe content using modern-screenshot
      const dataUrl = await domToPng(iframe.contentDocument!.body);
      
      // Convert data URL to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // Create file from blob
      const file = new File([blob], 'preview.png', { type: 'image/png' });

      const data = await uploadFile(file, '/api/file/upload');
      return data.result;
    } catch (error) {
      console.error('Failed to capture preview:', error);
      return null;
    }
  };

  const handleSave = async () => {
    const previewData = await capturePreview();

    // Add preview URL to form data before submitting
    // if (previewUrl) {
    //   mergeVertexProperties(txnId()!, formStoreVertex().id, graph, setGraph, {
    //     preview: previewUrl
    //   });
    // }

    // Call original form submit
    await formSubmit(
      formStoreVertex,
      graph,
      setGraph,
      () => {},
      showErrorToast,
      showLoadingToast,
      showWarningToast
    )();
  };

  return (
    <IconButton
      class={`${isDisabled() ? "cursor:not-allowed" : ""} ${headerIconButtonClass}`}
      icon="ph:floppy-disk"
      onClick={handleSave}
      size={22}
      title="Save"
    />
  );
}
