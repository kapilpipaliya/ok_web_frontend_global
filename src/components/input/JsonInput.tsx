//This library jsoneditor has a successor: svelte-jsoneditor. TODO: Migrate to it
// @ts-ignore
import JSONEditor, { JSONEditorOptions } from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
// TODO: move to new beta version of jsonEditor:
// https://github.com/josdejong/jsoneditor/issues/1223
import { createSignal, For, onCleanup, Show, untrack } from "solid-js";
// import { Label } from '../Label';
// import { Field } from '../../form2';


interface Properties {

  name?: string;
  class?: string;
  disabled?: boolean;

  required?: boolean;
  errors: string[];
  setValue: (value: string) => void;
  value: string;
}

export const JsonInput = (props: Properties) => {
  // here we provide a default form control in case the user doesn't supply one
  const [hasError, setHasError] = createSignal("");
  let jsonEditor: JSONEditor;

  const options: JSONEditorOptions = {
    mode: props.disabled ? "view" : "text", // code
    modes: ["code", "tree", "text"],
    onChange() {
      try {
        const value = jsonEditor.get();
        untrack(() => {
          // reconcile not working here:
          props.setValue(value);
        });

        setHasError("");
      } catch (err: any) {
        setHasError(err.message);
      }
    },
  };

  const createEditor = (el: HTMLDivElement) => {
    jsonEditor = new JSONEditor(el, options, props.value || {});
  };
  /* let updatePropsValue = true;
   createComputed(() => {
    // reset editor focus when editor value change
    if (typeof props.field.value === 'object' && jsonEditor && updatePropsValue) jsonEditor.set(props.field.value);
  }); */
  // Temporary commenting this:
  //createComputed(() => {
    // if (props.value && jsonEditor) jsonEditor.set(props.value);
  //});

  onCleanup(() => {
    if (jsonEditor) jsonEditor.destroy();
  });

  return (
    <>
      {/* <Label name={props.label || ''} /> */}
      <div ref={createEditor} style="width: 600px; height: 400px; display: inline-block;" />
      <span>{hasError()}</span>

      <Show when={props.errors}>
        <For each={Object.values(props.errors)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>
      </Show>
    </>
  );
};
