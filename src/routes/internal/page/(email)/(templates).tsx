import { JSX } from "solid-js";

import { GetInitialData } from "~/GetInitialData";

export default function TemplateLayout(props: { children: JSX.Element }) {
  return (
    <GetInitialData authenticate={true} dontRedirectToLogin={true}>
      {props.children}
    </GetInitialData>
  );
}