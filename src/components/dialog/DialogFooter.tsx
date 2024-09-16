import { JSX, Show, splitProps } from "solid-js";

export const dialogOkButtonClass =
  "lh:1.25rem  align-items:center  bg:indigo-60  bg:indigo-50:hover  border-radius:0.375rem box-shadow:0|1px|2px|0|rgba(0,0,0,0.05) color:white display:inline-flex f:0.875rem  font:semibold  outline-color:indigo-50:focus-visible  outline-offset:2px:focus-visible outline-style:solid:focus-visible outline-width:2px:focus-visible px:0.75rem py:0.5rem";
export const dialogCancelButtonClass =
  "lh:1.25rem  align-items:center  bg:white  border-radius:0.375rem  border-width:1px  border-color:gray-30  color:gray-90  display:inline-flex  f:0.875rem  font:semibold  outline-color:gray-30:focus-visible  outline-offset:2px:focus-visible outline-style:solid:focus-visible outline-width:2px:focus-visible px:0.75rem py:0.5rem";

export function DialogFooter(
  props: {
    children?: any;
    disabled?: boolean;
    buttonText?: string;
  } & JSX.IntrinsicElements["button"]
) {
  const [local, buttonProps] = splitProps(props, ["children", "buttonText"]);

  return (
    <div class="flex ai:center gap:0.50rem jc:center mt:0.25rem">
      <Show when={local.children}>{local.children}</Show>
      <Show when={!local.children}>
        <button class={dialogOkButtonClass} {...buttonProps} type="button">
          {local.buttonText || "Save"}
        </button>
      </Show>
    </div>
  );
}
