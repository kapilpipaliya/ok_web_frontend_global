import {
  createEffect,
  createResource,
  createSignal,
  For,
  Match,
  Suspense,
  Switch,
  Show,
} from "solid-js";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { useToast } from "~/components/styled/modal/Toast";
import { getTreeDataAPICall } from "~/cypher/get/getTreeDataAPICall";
import type { GraphData } from "~/cypher/types/ServerResult";
import { SearchBar } from "~/components/styled/SearchBar";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { STYLES } from "~/pages/settings/constants";

import { FunctionItem } from "./FunctionItem";
import { As } from "~/components/As";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface FunctionNavItem {
  id: string;
  key: string;
  P: Record<string, unknown>;
}

type FetchResult =
  | Awaited<ReturnType<typeof getTreeDataAPICall>>
  | { error: string };

export function FunctionsList() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast } = useToast();
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  let originalData: FunctionNavItem[] = [];
  const [filteredData, setFilteredData] = createSignal<FunctionNavItem[]>([]);

  async function fetchData(): Promise<FetchResult> {
    try {
      return await getTreeDataAPICall({
        collection: "g:'Function'",
      });
    } catch (error: unknown) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  const [data] = createResource(fetchData);

  createEffect(() => {
    if (!data()) return;
    const result = data() as FetchResult;
    if ("error" in result && result.error) {
      showErrorToast(result.error);
      setIsFetchingData(false);
      return;
    }
    if ("graph" in result && result.graph?.vertexes) {
      setGraphData(graph, setGraph, result.graph as GraphData, {
        skipExisting: true,
      });
    }
    if ("children" in result && Array.isArray(result.children)) {
      originalData = (result.children as FunctionNavItem[]).map((c) => ({
        id: c.id,
        key: c.key ?? "",
        P: c.P ?? {},
      }));
      updateFilteredData();
    }
    setIsFetchingData(false);
  });

  const updateFilteredData = () => {
    if (searchQuery()) {
      const q = searchQuery().toLowerCase();
      setFilteredData(
        originalData.filter((item) => item.key?.toLowerCase().includes(q)),
      );
    } else {
      setFilteredData(originalData);
    }
  };

  return (
    <Suspense fallback={<LoaderNew loaderHeight="55vh" />}>
      <Switch>
        <Match when={data.error}>
          <As as="div" css={STYLES.overflowCss}>
            Error: {String(data.error)}
          </As>
        </Match>
        <Match when={!isFetchingData()}>
          <>
            <Show when={filteredData().length >= 5 || searchQuery()}>
              <SearchBar
                handleChange={(value) => {
                  setSearchQuery(value);
                  updateFilteredData();
                }}
                placeholder="Search functions..."
                value={searchQuery()}
              />
            </Show>
            <As
              as="div"
              css={[STYLES.overflowCss, `return \`._id { display: grid; }\`;`]}
            >
              <For each={filteredData()}>
                {(item) => <FunctionItem item={item} />}
              </For>
            </As>
          </>
        </Match>
      </Switch>
    </Suspense>
  );
}
