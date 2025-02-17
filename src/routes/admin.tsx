import type { RouteSectionProps } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { AdminLayout } from "~/pages/AdminLayout";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  return (
    <GetInitialData authenticate>
      <AdminLayout>{props.children}</AdminLayout>
    </GetInitialData>
  );
}
