import type { RouteSectionProps } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";

export default function AuthLayout(props: Readonly<RouteSectionProps>) {
  return (
    <GetInitialData authenticate={true} dontRedirectToLogin={true}>
      {props.children}
    </GetInitialData>
  );
}
