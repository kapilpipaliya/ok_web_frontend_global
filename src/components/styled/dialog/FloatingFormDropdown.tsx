import type { JSX } from "solid-js";
import { Show } from "solid-js";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/styled/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";

export function FloatingFormDropdown(props: {
  title: string;
  subtitle?: string;
  parentRef: HTMLElement;
  onClickOutside?: () => void;
  onMouseLeave?: () => void;
  footerButtonText?: string;
  footerDisabled?: boolean;
  footerLoading?: boolean;
  onFooterClick?: () => void;
  showFooter?: boolean;
  children: JSX.Element;
  error?: string;
}) {
  const showFooter = () => props.showFooter !== false;
  return (
    <DropdownMenu
      css={`return \`._id {
  padding: 0.50rem;
}\`;`}
      onClickOutside={props.onClickOutside}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <DialogHeader title={props.title} />
      <Show when={props.subtitle}>
        <DialogSubTitle>{props.subtitle}</DialogSubTitle>
      </Show>

      {props.children}

      <Show when={props.error}>
        <As
          as="div"
          css={`return \`._id {
  color: \${t.var.color.error};
  margin-top: 0.5rem;
}\`;`}
        >
          {props.error}
        </As>
      </Show>

      <Show when={showFooter()}>
        <DialogFooter
          buttonText={props.footerLoading ? "Saving..." : props.footerButtonText ?? "Save"}
          css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS]}
          disabled={props.footerDisabled || props.footerLoading}
          onClick={() => props.onFooterClick?.()}
        />
      </Show>
    </DropdownMenu>
  );
}
