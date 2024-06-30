import type { RouteSectionProps } from "@solidjs/router";
import { MainDashboard } from "~/pages/dashboard/MainDashboard";
import { GetInitialData } from "~/GetInitialData";

export default function AdminLayout(props: Readonly<RouteSectionProps>) {
  return (
    <GetInitialData>
      <MainDashboard>
        {props.children}
      </MainDashboard>
    </GetInitialData>
  );
}
