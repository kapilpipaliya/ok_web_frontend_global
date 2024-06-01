import { useParams } from "@solidjs/router";
import { AbstractGrid } from "~/pages/dynamic/Grid/AbstractGrid";

export default function admin() {
  const params = useParams();
  return <AbstractGrid tableId={params.entity} />;
}
