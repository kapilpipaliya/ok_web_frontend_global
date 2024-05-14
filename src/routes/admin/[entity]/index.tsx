import { useParams } from "@solidjs/router";
import { Show, createEffect, createSignal, on } from "solid-js";
import { API, DataFetcher } from "~/components/api/DataFetcher";
import { AbstractSingleGrid } from "~/pages/dynamic/Grids";

export default function admin() {
  const params = useParams();

  // fix for when pages changed, data was not refetched
  const [count, setCount] = createSignal(1);
  createEffect(
    on(
      () => params.entity,
      (v) => {
        if (v) {
          setCount((v) => v + 1);
        }
      },
      { defer: true },
    ),
  );

  return (
    <Show when={count()} keyed>
      <DataFetcher
        renderContent={<AbstractSingleGrid tableId={params.entity} />}
        fetchData={API.getPagesDataUrl}
      />
    </Show>
  );
}
