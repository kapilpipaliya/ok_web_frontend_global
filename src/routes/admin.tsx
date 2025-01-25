import type { RouteSectionProps } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { AdminLayout } from "~/pages/admin_layout/AdminLayout";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  return (
    <GetInitialData>
      <AdminLayout>{props.children}</AdminLayout>
    </GetInitialData>
  );
}
