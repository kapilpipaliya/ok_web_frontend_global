import { createWritableMemo } from "@solid-primitives/memo";
import {
  createEffect,
  createSignal,
  type JSX,
  Match,
  splitProps,
  Switch,
} from "solid-js";

import { getSelectedVertexValue } from "~/lib/graph/get/sync/getSelectedVertexValue";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { setSelectValueHelper } from "../fields/utils/setSelectValueHelper";
import { runEvent } from "../solid_blocks/tools";

export type FileUploaderProps = JSX.HTMLAttributes<HTMLLabelElement> & {
  data?: Vertex;
  label?: string;
  media?: string;
  meta?: Vertex;
  onUploadSuccess?: (data: any) => void;
  setValue?: (file: File) => void;
  txnId?: number;
};

export function FileUploader(props: FileUploaderProps) {
  const [graph, setGraph] = useGraph();
  const [localProps, others] = splitProps(props, [
    "setValue",
    "meta",
    "data",
    "label",
    "media",
    "onUploadSuccess",
  ]);
  const [file, setFile] = createSignal<File | null>(null);
  const [fullBoxMedia, setFullBoxMedia] = createSignal("");
  let inputRef: HTMLInputElement | undefined;

  const [_selectedFiles, setSelectedFiles] = createWritableMemo(() =>
    getSelectedVertexValue(graph, props.data, props.meta),
  );

  const handleFileUpload = async (file: File) => {
    if (file) {
      try {
        return await uploadFile(file, "/api/file/upload");
      } catch (error) {
        // Handle the error case
        console.error("Upload error:", error);
      }
    }
  };

  // on file select
  // 4. on reload it should display preview.
  const setValue = async (files?: FileList | null) => {
    const txnId = props.txnId ?? 0;
    const file = files?.[0];
    if (file) {
      setFile(file);
      setFullBoxMedia(URL.createObjectURL(file));
      // localProps.setValue?.(file);
      const data = await handleFileUpload(file);
      if (data?.graph) {
        setGraphData(graph, setGraph, data.graph);
        // Call the onUploadSuccess callback if provided
        if (localProps.onUploadSuccess) {
          localProps.onUploadSuccess(data);
          return;
        }
        if (props.data) {
          setSelectValueHelper(
            txnId,
            props.meta!,
            props.data as Vertex,
            "MultiSelect",
            data.result,
            false,
            graph,
            setGraph,
          );
        } else {
          setSelectedFiles(data.result);
        }
      }
    }
  };

  createEffect(() => {
    if (localProps.media) {
      setFile(localProps.media);
      setFullBoxMedia(localProps.media);
    }
  });

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setValue(event.dataTransfer?.files);
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleInputChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    setValue(input.files);
  };

  const handleFullBoxClick = () => {
    if (inputRef) {
      inputRef.click();
    }
  };

  return (
    <div // NOSONAR
      draggable={false}
      onClick={handleFullBoxClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        "background-position": "center",
        "background-size": "cover",
        border: fullBoxMedia() === "" ? "2px dashed #ccc" : "",
        "border-radius": "10px",
        cursor: "pointer",
        padding: "20px",
        position: "relative",
        "text-align": "center",
      }}
    >
      <input
        accept="image/*, video/*"
        onChange={(event) => {
          runEvent(event, handleInputChange);
        }}
        ref={inputRef!}
        style={{ display: "none" }}
        type="file"
        {...others}
      />
      <Switch>
        <Match when={file()}>
          <Switch>
            <Match when={file()!.type.startsWith("image/")}>
              <img
                alt="Media"
                src={fullBoxMedia()}
                style={{
                  "border-radius": "10px",
                  "max-height": "100%",
                  "max-width": "100%",
                }}
              />
            </Match>
            <Match when={file()!.type.startsWith("video/")}>
              <video
                controls
                src={fullBoxMedia()}
                style={{
                  "border-radius": "10px",
                  "max-height": "100%",
                  "max-width": "100%",
                }}
              />
            </Match>
          </Switch>
        </Match>
        <Match when={!file()}>
          <span>{localProps.label || "Click to select a media file"}</span>
        </Match>
      </Switch>
    </div>
  );
}

export async function uploadFile(file: File, apiUrl: string, method = "POST") {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(apiUrl, {
      body: formData,
      method,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the file upload:", error);
    throw error;
  }
}
