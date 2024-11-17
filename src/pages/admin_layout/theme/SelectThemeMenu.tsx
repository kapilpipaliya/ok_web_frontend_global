import { createSignal, For, Show, onMount } from "solid-js";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { useToast } from "~/components/styled/Toast";
import { getGlobalSettingVertex, getGlobalThemeVertex } from "~/getGlobalThemeVertex";
import { useGraph, Vertex, type Id } from "~/lib/graph/graph";
import { ThemeConfigButton } from "./theme_config/ThemeConfigButton";
import { ThemePreview } from "./theme_config/ThemePreview";
import { AddNewThemeDialog } from "./AddNewThemeDialog";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { handleDataSubmission } from "~/lib/graph/mutate/handleDataSubmission";
import { GlobalSetting } from "~/lib/meta/base/GlobalSetting";

export function SelectThemeMenu() {
  const [graph, setGraph] = useGraph();
  const [selectedTheme, setSelectedTheme] = createSignal<Id>();
  const [loading, setLoading] = createSignal(true);
  const { showErrorToast, showSuccessToast } = useToast();
  const [error, setError] = createSignal<string | null>(null);

  const loadThemes = async () => {
    const result = await fetchAndSetGraphData(graph, setGraph, "g:'Theme'");
    if (result.error) {
      showErrorToast(result.error);
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  onMount(async () => {
    loadThemes();
  });

  const handleThemeSelect = async (themeId: Id) => {
    setSelectedTheme(themeId);
    const globalSettingVertex = getGlobalSettingVertex(graph);
    if (!globalSettingVertex) {
      return;
    }

    const newFormTxnId = graph.newTxnId;

    const themeMetaAttribute = GlobalSetting.attributes.find((attr) => attr.key === "Theme");
    if (!themeMetaAttribute) {
      return;
    }

    const selectedThemeMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: themeMetaAttribute,
    } as Vertex;

    setSelectionValue(
      newFormTxnId,
      globalSettingVertex,
      graph,
      setGraph,
      selectedThemeMetaVertex,
      themeId,
    );

    const isSuccess = await handleDataSubmission(newFormTxnId, graph, setGraph, showErrorToast, showSuccessToast, {
      successMessage: null,
      errorMessage: "An error occurred while selecting the theme",
    });
  };

  return (
    <>
      <DialogHeader title="Themes" />
      <Show when={error()}>
        <div>{error()}</div>
      </Show>
      <Show when={loading()}>
        <div>Loading...</div>
      </Show>
      <Show when={!loading() && !error()}>
        <ul class="width:100%">
          <For each={graph.vertexLabelIdMap.Theme}>
            {(theme) => {
              const isSelected = () => getGlobalThemeVertex(graph)?.id === theme;
              return (
                <li
                  class={`${
                    isSelected() ? "bg:beryl-45" : ""
                  } flex ai:center bg:lightblue:hover jc:space-between p:0.25rem`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  <span >
                    <Show when={isSelected()}>
                      <span>✔️</span>
                    </Show>
                    {graph.vertexes[theme].P.key}
                  </span>
                  <ThemePreview item={graph.vertexes[theme]} />
                  <div onClick={(e) => e.stopPropagation()}>
                    <ThemeConfigButton item={graph.vertexes[theme]} size={16} />
                  </div>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
      <AddNewThemeDialog />
    </>
  );
}
