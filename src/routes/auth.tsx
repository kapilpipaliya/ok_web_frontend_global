import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { GetInitialData } from "~/GetInitialData";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { useGraph } from "~/lib/graph/graph";

export default function AuthLayout(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <>
      <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
      <GetInitialData authenticate={false} dontRedirectToLogin={true}>
        {props.children}
      </GetInitialData>
    </>
  );
}
