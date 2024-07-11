import { type JSX, createEffect, createSignal, splitProps } from "solid-js";

import { runEvent } from "./tools";

export type FileUploaderProps = {
  data?: any;
  label?: string;
  media?: string;
  meta?: any;
  setValue?: (meta: any, data: any, file: File) => void;
} & JSX.HTMLAttributes<HTMLLabelElement>;

export function FileUploader(props: FileUploaderProps) {
  const [inputProps, content, labelProps] = splitProps(
    props,
    [],
    ["setValue", "meta", "data", "label"],
  );
  const [file, setFile] = createSignal<File | any | null>(null);
  const [fullBoxMedia, setFullBoxMedia] = createSignal("");

  createEffect(() => {
    if (props.media) {
      setFile(props.media);
      setFullBoxMedia(props.media);
    }
  });

  const handleDrop = (event: any) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFullBoxMedia(URL.createObjectURL(droppedFile));
      props.setValue?.(props.meta, props.data, droppedFile);
    }
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  const handleInputChange = (event: any) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFullBoxMedia(URL.createObjectURL(selectedFile));
      props.setValue?.(props.meta, props.data, selectedFile);
    }
  };

  const handleFullBoxClick = () => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div
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
      <label {...labelProps}>
        <input
          accept="image/*, video/*"
          style={{ display: "none" }}
          type="file"
          {...inputProps}
          onChange={(event) => {
            runEvent(event, handleInputChange);
          }}
        />
        {file() !== null ? (
          <>
            {file().type.startsWith("image/") ? (
              <img
                {...(props as JSX.HTMLAttributes<HTMLInputElement>)}
                alt="Media"
                src={fullBoxMedia()}
                style={{
                  "border-radius": "10px",
                  "max-height": "100%",
                  "max-width": "100%",
                }}
              />
            ) : (
              <video
                {...(props as JSX.HTMLAttributes<HTMLVideoElement>)}
                controls
                src={fullBoxMedia()}
                style={{
                  "border-radius": "10px",
                  "max-height": "100%",
                  "max-width": "100%",
                }}
              />
            )}
          </>
        ) : (
          <span>{props.label || "Click to select a media file"}</span>
        )}
      </label>
    </div>
  );
}
