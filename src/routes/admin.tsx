import type { RouteSectionProps } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { MainDashboard } from "~/pages/dashboard/MainDashboard";

export default function AdminLayout(props: Readonly<RouteSectionProps>) {
  return (
    <GetInitialData>
      <MainDashboard>
        {props.children}
      </MainDashboard>
    </GetInitialData>
  );
}
