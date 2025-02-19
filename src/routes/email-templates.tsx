import type { RouteSectionProps } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";

export default function EmailTemplatesLayout(
  props: Readonly<RouteSectionProps>,
) {
  return (
    <GetInitialData authenticate dontRedirectToLogin>
      {props.children}
    </GetInitialData>
  );
}
