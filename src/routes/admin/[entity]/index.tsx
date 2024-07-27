import { useParams } from "@solidjs/router";

import { GridWrapper } from "~/components/grid/GridWrapper";

export default function TablePage() {
  const params = useParams();
  return <GridWrapper tableId={params.entity} />;
}
