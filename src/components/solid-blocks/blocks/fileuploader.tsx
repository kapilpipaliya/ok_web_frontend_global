import {
  Component,
  JSX,
  createEffect,
  createSignal,
  splitProps,
} from "solid-js";
import { runEvent } from "./tools";

export type FileUploaderProps = JSX.HTMLAttributes<HTMLInputElement> & {
  setValue?: (meta: any, data: any, file: File) => void;
  meta?: any;
  data?: any;
  label?: string;
  image?: File;
};

export const FileUploader: Component<FileUploaderProps> = (props: any) => {
  const [inputProps, content, labelProps] = splitProps(
    props,
    [],
    ["setValue", "meta", "data", "label"]
  );
  const [file, setFile] = createSignal(null);
  const [fullBoxImage, setFullBoxImage] = createSignal("");

  createEffect(() => {
    if (props.image) {
      setFile(props.image);
      setFullBoxImage(props.image);
    }
  });

  const handleDrop = (event: any) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFullBoxImage(URL.createObjectURL(droppedFile));
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
      setFullBoxImage(URL.createObjectURL(selectedFile));
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
        border: fullBoxImage()==="" ? "2px dashed #ccc" : "",
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
          style={{ display: "none" }}
          {...inputProps}
          onChange={(event) => {
            runEvent(event, handleInputChange);
          }}
        />
        {file() !== null ? (
          <>
            <img
              src={fullBoxImage()}
              alt="Image"
              style={{
                "max-width": "100%",
                "max-height": "100%",
                "border-radius": "10px",
              }}
            />
          </>
        ) : (
          <span>{props.label || "Click to select an image"}</span>
        )}
      </label>
    </div>
  );
};
