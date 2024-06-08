import { useParams } from "@solidjs/router";
import { AbstractGrid } from "~/components/dynamic/grid/AbstractGrid";

export default function admin() {
  const params = useParams();
  return <AbstractGrid tableId={params.entity} />;
}
