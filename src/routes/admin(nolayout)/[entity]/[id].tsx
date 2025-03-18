import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { GetInitialData } from "~/GetInitialData";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { useGraph } from "~/lib/graph/graph";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <GetInitialData authenticate>
      <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
      {props.children}
    </GetInitialData>
  );
}
