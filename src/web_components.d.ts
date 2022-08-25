import {JSX} from 'solid-js';
declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "aero-modal": JSX.IntrinsicElements["div"] & { foo: number };
      "ui5-button": JSX.IntrinsicElements["button"] & { design?: string; icon?: string };
      "ui5-input": JSX.IntrinsicElements["input"] & {};
      "ui5-file-uploader": JSX.IntrinsicElements["input"] & {};
      "ui5-card": JSX.IntrinsicElements["div"] & {};
      "ui5-card-header": JSX.IntrinsicElements["div"] & {};
      "ui5-shellbar": JSX.IntrinsicElements["div"] & {};
      "ui5-side-navigation": JSX.IntrinsicElements["div"] & {};
      "ui5-side-navigation-item": JSX.IntrinsicElements["div"] & {text: string};
      "ui5-side-navigation-sub-item": JSX.IntrinsicElements["div"] & {text: string};
      "ui5-busy-indicator": JSX.IntrinsicElements["div"] & {text: string};
    }
  }
}
