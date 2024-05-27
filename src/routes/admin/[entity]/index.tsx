import { useParams } from "@solidjs/router";
import { createEffect, createSignal, on, Show } from "solid-js";
import { AbstractGrid } from "~/pages/dynamic/Grid/AbstractGrid";

export default function admin() {
  const params = useParams();
  return (
    <AbstractGrid tableId={params.entity} />
  );
}
