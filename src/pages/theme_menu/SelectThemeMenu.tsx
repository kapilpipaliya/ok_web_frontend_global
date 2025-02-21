import { createSignal, For, onMount, Show } from "solid-js";

import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { useToast } from "~/components/styled/Toast";
import {
  getGlobalSettingVertex,
  getGlobalThemeVertex,
} from "~/lib/graph/get/sync/getGlobalThemeVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";
import { handleDataSubmission } from "~/lib/graph/mutate/handleDataSubmission";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { GlobalSetting } from "~/lib/meta/base/GlobalSetting";

import { AddNewThemeDialog } from "./AddNewThemeDialog";
import { ThemeConfigButton } from "./theme_config/ThemeConfigButton";
import { ThemePreview } from "./theme_config/ThemePreview";

export function SelectThemeMenu(props: { isStandalone?: boolean }) {
  const [graph, setGraph] = useGraph();
  const [_selectedTheme, setSelectedTheme] = createSignal<Id>();
  const [loading, setLoading] = createSignal(true);
  const { showErrorToast, showSuccessToast } = useToast();
  const [error, setError] = createSignal<null | string>(null);

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

    const newFormTxnId = generateNewTxnId(graph, setGraph);

    const themeMetaAttribute = GlobalSetting.attributes.find(
      (attr) => attr.key === "Theme",
    );
    if (!themeMetaAttribute) {
      return;
    }

    const selectedThemeMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: { type: "GlobalSettingTheme" },
    } as Vertex;

    setSelectionValue(
      newFormTxnId,
      globalSettingVertex,
      graph,
      setGraph,
      selectedThemeMetaVertex,
      themeId,
    );

    const _isSuccess = await handleDataSubmission(
      newFormTxnId,
      graph,
      setGraph,
      showErrorToast,
      showSuccessToast,
      {
        errorMessage: "An error occurred while selecting the theme",
        successMessage: null,
      },
    );
  };

  return (
    <>
      <Show when={!props.isStandalone}>
        <DialogHeader title="Themes" />
      </Show>
      <Show when={error()}>
        <div class="p:0.5rem fg:error">{error()}</div>
      </Show>
      <Show when={loading()}>
        <div class="p:0.5rem">Loading...</div>
      </Show>
      <Show when={!(loading() || error())}>
        <ul class={`width:100% ${props.isStandalone ? 'max-height:none' : 'max-height:300px'} overflow-y:auto`}>
          <For each={graph.vertexLabelIdMap.Theme}>
            {(theme) => {
              const isSelected = () =>
                getGlobalThemeVertex(graph)?.id === theme;
              return (
                <li
                  class={`${
                    isSelected() ? "bg:primary-30" : ""
                  } flex ai:center bg:primary-20:hover jc:space-between p:0.5rem cursor:pointer border-bottom:1px|solid|#eee`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  <div class="flex ai:center gap:0.5rem">
                    <Show when={isSelected()}>
                      <span class="fg:primary">✓</span>
                    </Show>
                    <span>{graph.vertexes[theme].P.key}</span>
                  </div>
                  <div class="flex ai:center gap:0.5rem">
                    <ThemePreview item={graph.vertexes[theme]} />
                    <div onClick={(e) => e.stopPropagation()}>
                      <ThemeConfigButton item={graph.vertexes[theme]} size={16} />
                    </div>
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
