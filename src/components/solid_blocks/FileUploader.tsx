import { createEffect, createSignal, type JSX, splitProps } from "solid-js";
import { runEvent } from "./tools";

export type FileUploaderProps = JSX.HTMLAttributes<HTMLLabelElement> & {
  setValue?: (meta: any, data: any, file: File) => void;
  meta?: any;
  data?: any;
  label?: string;
  media?: string;
};

export function FileUploader(props: FileUploaderProps) {
  const [inputProps, content, labelProps] = splitProps(
    props,
    [],
    ["setValue", "meta", "data", "label"]
  );
  const [file, setFile] = createSignal<File | null | any>(null);
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
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleFullBoxClick}
      draggable={false}
      style={{
        position: "relative",
        border: fullBoxMedia() === "" ? "2px dashed #ccc" : "",
        padding: "20px",
        "border-radius": "10px",
        "text-align": "center",
        cursor: "pointer",
        "background-size": "cover",
        "background-position": "center",
      }}
    >
      <label {...labelProps}>
        <input
          type="file"
          accept="image/*, video/*"
          style={{ display: "none" }}
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
                src={fullBoxMedia()}
                alt="Media"
                style={{
                  "max-width": "100%",
                  "max-height": "100%",
                  "border-radius": "10px",
                }}
              />
            ) : (
              <video
                  {...(props as JSX.HTMLAttributes<HTMLVideoElement>)}
                controls
                src={fullBoxMedia()}
                style={{
                  "max-width": "100%",
                  "max-height": "100%",
                  "border-radius": "10px",
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
