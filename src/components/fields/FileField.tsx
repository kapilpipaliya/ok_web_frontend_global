/**
 *
 * \todo Implement drag and drop from: Svelte-FileField-Upload-Component
 * https://github.com/vipero07/svelte-file-upload-component
 */
import { createSignal, type JSX, splitProps } from "solid-js";
import { createStore } from "solid-js/store";

import { useToast } from "~/components/Toast";

interface Properties
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onchange"> {
  class?: string;
  disabled?: boolean;
  dom?: HTMLInputElement;
  error?: string;
  help?: string;
  label: string;
  name?: string;
  onchange?: (value: string) => void;
  value?: string;
}

/* Work In Progress */
export function FileField(props: Readonly<Properties>) {
  const [p, customProps] = splitProps(props, [
    "label",
    "prefix",
    "help",
    "error",
    "onchange",
    "onChange"
  ]);

  // using XMLHttpRequest because fetch can't track upload process yet
  // https://javascript.info/xmlhttprequest
  let xhr: XMLHttpRequest;
  let oTime = 0;
  let oLoaded = 0;
  const [state, setState] = createStore({ error: "" });
  const [speedText, setSpeedText] = createSignal("");
  const [percentageText, setPercentageText] = createSignal("");
  const { showSuccessToast } = useToast();
  const [progressBar, setProgressBar] = createStore({ max: 100, value: 0 });

  // FileField uploading method
  function UploadFile() {
    function uploadFile(_evt: ProgressEvent<EventTarget>) {
      if (xhr.responseText) {
        const data = JSON.parse(xhr.responseText);
        if (data.error) {
          setState({ error: `Upload failed! ${data.description}` });
        } else {
          showSuccessToast("Uploaded successfully!");
          if (p.onchange) {
            p.onchange(data.media);
          }
        }
      } else {
        setState({ error: `Upload failed: ${xhr.statusText}` });
      }
    }

    function progressFunction(evt: ProgressEvent<EventTarget>) {
      if (evt.lengthComputable) {
        setProgressBar({ max: evt.total, value: evt.loaded });
        setPercentageText(`${Math.round((evt.loaded / evt.total) * 100)}%`);
      }
      const nt = new Date().getTime();
      const percentageTime = (nt - oTime) / 1000;
      oTime = new Date().getTime();
      const percentageLoad = evt.loaded - oLoaded;
      oLoaded = evt.loaded;
      let speed = percentageLoad / percentageTime;
      const byteSpeed = speed;
      let units = "b/s";
      if (speed / 1024 > 1) {
        speed /= 1024;
        units = "k/s";
      }
      if (speed / 1024 > 1) {
        speed /= 1024;
        units = "M/s";
      }
      const restTime = ((evt.total - evt.loaded) / byteSpeed).toFixed(1);
      setSpeedText(
        `,Speed: ${speed.toFixed(1)}${units}, the remaining time: ${restTime}s`,
      );
      if (byteSpeed === 0) {
        setSpeedText("Upload cancelled");
      }
    }

    if (props.dom?.files) {
      const fileObj = props.dom.files[0]; // js get file object
      const url = "/api/upload";

      const form = new FormData(); // FormData object
      form.append("file", fileObj); // FileField object

      xhr = new XMLHttpRequest(); // XMLHttpRequest object
      xhr.open("post", url, true); // post
      xhr.onload = uploadFile;
      xhr.onerror = () => {
        setState("error", "FileField Cant Loaded by the browser");
      };

      xhr.upload.onprogress = progressFunction;
      xhr.upload.onloadstart = () => {
        oTime = new Date().getTime();
        oLoaded = 0;
      };

      xhr.send(form);
    }
  }

  function cancelUploadFile() {
    xhr.abort();
  }

  return (
    <>
      <progress
        class="width:300px"
        max={progressBar.max}
        value={progressBar.value}
      />
      <span>{percentageText()}</span>
      <span>{speedText()}</span>
      <input
        name={props.label || ""}
        ref={props.dom}
        type="file"
        {...customProps}
      />
      <input onClick={UploadFile} type="button" value="Upload" />
      <input onClick={cancelUploadFile} type="button" value="Cancel" />

      <span>{props.error}</span>
      <span>{state.error}</span>
    </>
  );
}
