/*
const addedfile = (file:DragEvent) => console.log(file);
const drop = (event:DragEvent) => console.log(event.target);
const init = (d: Dropzone) => 0;
// pass this event from parent:
dropzoneEvents={{ addedfile, drop, init }}
options={{ clickable: true, acceptedFiles: 'text/javascript', maxFilesize: 256, init }}
*/
import { JSX } from "solid-js";
import Dropzone from "dropzone";
import { Label } from "./Label";

/*
<style>
  .dropzone {
    height: 300px;
    background: #fdfdfd;
    border-radius: 5px;
    border: 2px dashed #ff3e00;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 300ms ease-out;
  }
  .dropzone.dropzone-hoovering {
    border: 2px solid #ff3e00;
    background: rgba(255, 62, 0, 0.05);
  }
</style>
*/

interface Properties {
  disabled?: boolean;
  onChange: JSX.EventHandler<HTMLInputElement, Event>;
  //isSaving?: boolean
  required?: boolean;
  value: string;
  error?: string;
  placeholder?: string;
  label?: string;
  props?: {};
  dom?: HTMLInputElement;
  class?: string;
  type: string;

  dropzoneEvents: { [event: string]: (e: DragEvent) => any };
  options: { previewTemplate: "<div/>"; dictDefaultMessage?: string; clickable?: boolean };
  dropzoneClass: "dropzone";
  hooveringClass: "dropzone-hoovering";
  id: "dropId";
  autoDiscover: boolean;
  children?: HTMLElement;

  // export let dropzoneEvents = {};
  // export let options = { previewTemplate: "<div/>" };
  // export let dropzoneClass = "dropzone";
  // export let hooveringClass = "dropzone-hoovering";
  // export let id = "dropId";
  // export let autoDiscover = false;
}
// copied from: https://github.com/arnaudDerbey/svelte-dropzone/blob/master/dropzone.svelte
export const DropZone = (props: Properties) => {
  let dropzoneElement: HTMLDivElement | undefined;
  const createDropZone = () => {
    if (dropzoneElement) {
      if (!props.options.previewTemplate) {
        props.options.previewTemplate = "<div/>";
      }
      if (!props.options.dictDefaultMessage) {
        props.options.dictDefaultMessage = "";
      }
      const svDropzone = new Dropzone(dropzoneElement, {
        ...props.options,
      });
      if (props.autoDiscover !== true) {
        Dropzone.autoDiscover = false;
      }
      svDropzone.on("addedfile", (f) => {
        if (dropzoneElement) dropzoneElement.classList.remove(props.hooveringClass ?? "dropzone-hoovering");
      });
      svDropzone.on("dragenter", (e) => {
        console.log(dropzoneElement);
        if (dropzoneElement) dropzoneElement.classList.toggle(props.hooveringClass ?? "dropzone-hoovering");
      });
      svDropzone.on("dragleave", (e) => {
        if (dropzoneElement) dropzoneElement.classList.toggle(props.hooveringClass ?? "dropzone-hoovering");
      });
      Object.entries(props.dropzoneEvents).map(([eventKey, eventFunc]) => svDropzone.on(eventKey, eventFunc));
      if (props.options.clickable !== false) {
        if (dropzoneElement) dropzoneElement.style.cursor = "pointer";
      }
      svDropzone.on("error", (file, errorMessage) => {
        console.log(`Error: ${errorMessage}`);
      });
    }
  };
  const handleNodeChange = (node: HTMLDivElement) => {
    dropzoneElement = node;
    createDropZone();
  };
  return (
    <>
      <Label name={props.label || ""} />
      <div class={props.dropzoneClass || "dropzone"} ref={handleNodeChange}>
        {props.children ? props.children : <p>Drop files here to upload</p>}
        <input hidden name="sites_data" type="file" />
      </div>
      <span>{props.error}</span>
    </>
  );
};
