import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";
import { getCompanyFaviconUrl } from "~/lib/graph/get/sync/company/getCompanyFaviconUrl";

import { useGraph } from "~/lib/graph/context/UseGraph";

export default function AuthLayout(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <>
      <Link href={getCompanyFaviconUrl(graph) || ""} rel="icon" />
      {props.children}
    </>
  );
}
