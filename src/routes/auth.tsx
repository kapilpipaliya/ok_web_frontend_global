import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { GetInitialData } from "~/GetInitialData";
import { getCompanyLogoUrl } from "~/lib/graph/get/sync/getCompanyLogoUrl";
import { useGraph } from "~/lib/graph/graph";

export default function AuthLayout(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <>
      <Link href={getCompanyLogoUrl(graph) || ""} rel="icon" />
      <GetInitialData authenticate={true} dontRedirectToLogin={true}>
        {props.children}
      </GetInitialData>
    </>
  );
}
