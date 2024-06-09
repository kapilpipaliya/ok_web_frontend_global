import { useParams } from "@solidjs/router";
import { AbstractGrid } from "~/components/grid/AbstractGrid";

export default function admin() {
  const params = useParams();
  return <AbstractGrid tableId={params.entity} />;
}
