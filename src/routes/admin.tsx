import type { RouteSectionProps } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { AdminLayout } from "~/pages/admin_layout/AdminLayout";
import { TemplateGraphProvider } from "../pages/TemplateGraphProvider";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  return (
    <GetInitialData>
      <TemplateGraphProvider>
        <AdminLayout>{props.children}</AdminLayout>
      </TemplateGraphProvider>
    </GetInitialData>
  );
}
