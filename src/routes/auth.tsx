import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { GetInitialData } from "~/GetInitialData";
import { getCompanyCircularLogoUrl } from "~/lib/graph/get/sync/company/getCompanyCircularLogoUrl";
import { useGraph } from "~/lib/graph/graph";

export default function AuthLayout(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <>
      <Link href={getCompanyCircularLogoUrl(graph) || ""} rel="icon" />
      <GetInitialData authenticate={false} dontRedirectToLogin={true}>
        {props.children}
      </GetInitialData>
    </>
  );
}
