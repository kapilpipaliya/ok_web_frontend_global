import { useParams } from "@solidjs/router";
import { createEffect, createSignal, on, Show } from "solid-js";
import { API, DataFetcher } from "~/components/api/DataFetcher";
import { AbstractGrid } from "~/pages/dynamic/Grid/AbstractGrid";

export default function admin() {
  const params = useParams();
  return (
    <DataFetcher
      renderContent={<AbstractGrid tableId={params.entity} />}
      fetchData={API.getPagesDataUrl}
    />
  );
}
