import type { RouteSectionProps } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { SystemLayout } from "~/pages/SystemLayout";

export default function SystemLayoutRoute(props: Readonly<RouteSectionProps>) {
  return (
    <GetInitialData authenticate>
      <SystemLayout>{props.children}</SystemLayout>
    </GetInitialData>
  );
}
