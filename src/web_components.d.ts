import {JSX} from 'solid-js';
import { Alert } from "./Type";
declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "aero-modal": JSX.IntrinsicElements["div"] & { foo: number };
      "ui5-button": JSX.IntrinsicElements["button"] & { design?: string; icon?: string };
      "ui5-input": JSX.IntrinsicElements["input"] & {};
      "ui5-file-uploader": JSX.IntrinsicElements["div"] & {multiple: string; accept: string};
      "ui5-card": JSX.IntrinsicElements["div"] & {};
      "ui5-card-header": JSX.IntrinsicElements["div"] & {interactive?: boolean};
      "ui5-shellbar": JSX.IntrinsicElements["div"] & {};
      "ui5-side-navigation": JSX.IntrinsicElements["div"] & {};
      "ui5-side-navigation-item": JSX.IntrinsicElements["div"] & {text: string; icon: string; href?: string};
      "ui5-side-navigation-sub-item": JSX.IntrinsicElements["div"] & {text: string; icon: string; href?: string};
      "ui5-busy-indicator": JSX.IntrinsicElements["div"] & {active: boolean; size: string};
      "ui5-message-strip": JSX.IntrinsicElements["div"] & {design: Alert; hideCloseButton?: boolean; hideIcon?: boolean; children: JSX.Element}; // default: "Information", false, false// slots: default: any, icon: any
    }
  }
}
