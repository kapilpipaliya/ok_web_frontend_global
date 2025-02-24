import { createSignal, For, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import {
  getGlobalSettingVertex,
  getGlobalThemeVertex,
} from "~/lib/graph/get/sync/getGlobalThemeVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";
import { handleDataSubmission } from "~/lib/graph/mutate/handleDataSubmission";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { GlobalSetting } from "~/lib/meta/base/GlobalSetting";

import { SETTINGS_CONSTANTS } from "../settings/constants";
import { AddNewThemeDialog } from "./AddNewThemeDialog";
import { ThemeConfigButton } from "./theme_config/ThemeConfigButton";
import { ThemePreview } from "./theme_config/ThemePreview";

export function SelectThemeMenu(props: { isStandalone?: boolean }) {
  const [graph, setGraph] = useGraph();
  const [_selectedTheme, setSelectedTheme] = createSignal<Id>();
  const [loading, setLoading] = createSignal(true);
  const { showErrorToast, showSuccessToast } = useToast();
  const [error, setError] = createSignal<null | string>(null);
  const [confirmDelete, setConfirmDelete] = createSignal<Id | null>(null);

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

    await handleDataSubmission(
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

  const confirmDeleteTheme = (themeId: Id) => {
    setConfirmDelete(themeId);
  };

  const handleDeleteConfirmation = async () => {
    if (confirmDelete() === null) return;

    const themeId = confirmDelete();
    setConfirmDelete(null);

    try {
      const result = await postAPI(API.settings.theme.deleteUrl, { themeId }, "DELETE");
      if (result.success) {
        setGraphData(graph, setGraph, result.graph);
      }
      showSuccessToast("Theme deleted successfully");
      loadThemes(); // Reload themes after deletion
    } catch (error) {
      showErrorToast("Failed to delete theme");
    }
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
      <AddNewThemeDialog />
      <Show when={!(loading() || error())}>
        <ul class={`width:100% ${props.isStandalone ? 'max-height:none' : 'max-height:300px'} overflow-y:auto`}>
          <For each={graph.vertexLabelIdMap.Theme}>
            {(theme) => {
              const isSelected = () =>
                getGlobalThemeVertex(graph)?.id === theme;
              return (
                <li
                  class={`${isSelected() ? "bg:primary-30" : ""
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

                    <ThemeConfigButton item={graph.vertexes[theme]} size={18} />

                    <Show when={!isSelected()}>
                      <IconButton
                        class="color:error"
                        icon="ph:trash"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteTheme(theme);
                        }}
                        size={18}
                        title="Delete Theme"
                        tooltipGroup="theme-actions"
                      />
                    </Show>
                  </div>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
      <Show when={confirmDelete()}>
        <Portal>
          <div class={`${SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS}`}>
            <div class={SETTINGS_CONSTANTS.MODAL.HEADER.CLASS}>
              <h3 class={SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS}>Delete Theme</h3>
            </div>
            <p class={SETTINGS_CONSTANTS.MODAL.BODY.CLASS}>Are you sure you want to delete this theme?</p>
            <div class={SETTINGS_CONSTANTS.MODAL.FOOTER.CLASS}>
              <button class={SETTINGS_CONSTANTS.MODAL.BUTTONS.DELETE_CLASS} onClick={handleDeleteConfirmation}>Yes</button>
              <button class={SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS} onClick={() => setConfirmDelete(null)}>No</button>
            </div>
          </div>
        </Portal>
      </Show>
    </>
  );
}
