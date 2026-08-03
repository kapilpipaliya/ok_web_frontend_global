import { createEffect, createSignal, onMount, Show } from "solid-js";

import { FloatingFormDropdown } from "~/components/styled/dialog/FloatingFormDropdown";
import { KeyInputField } from "~/components/styled/dialog/KeyInputField";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import { useDesignerLayoutStore } from "~/features/page_designer/context/LayoutContext";
import type { PaletteTreeConfig } from "~/features/page_designer/form_elements/components/componentPaletteConfig";
import {
  createPaletteItem,
  defaultUrlFromKey,
} from "~/features/page_designer/form_elements/components/createPaletteItem";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function CreatePaletteItemMenu(props: {
  config: PaletteTreeConfig;
  selectedCategoryId: string | null | undefined;
  parentRef: HTMLElement;
  onClose: () => void;
  onClickOutside?: () => void;
}) {
  let keyInputRef!: HTMLInputElement;
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const [key, setKey] = createSignal("");
  const [url, setUrl] = createSignal("");
  const [urlTouched, setUrlTouched] = createSignal(false);
  const [error, setError] = createSignal("");
  const [isSaving, setIsSaving] = createSignal(false);
  const { showSuccessToast, showErrorToast } = useToast();

  const label = () => props.config.tableVertexLabel;
  const isPage = () => label() === "Page";

  createEffect(() => {
    if (isPage() && !urlTouched()) {
      const trimmedKey = key().trim();
      setUrl(trimmedKey ? defaultUrlFromKey(trimmedKey) : "");
    }
  });

  const canCreate = () => {
    if (!key().trim()) {
      return false;
    }
    if (isPage() && !url().trim()) {
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (isSaving() || !canCreate()) {
      return;
    }

    setIsSaving(true);
    setError("");

    const result = await createPaletteItem(graph, setGraph, {
      config: props.config,
      key: key().trim(),
      url: isPage() ? url().trim() : undefined,
      layoutStoreId: layoutStoreId!,
      selectedCategoryId: props.selectedCategoryId,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      showErrorToast(result.error);
      return;
    }

    showSuccessToast(`${label()} created successfully`);
    props.onClose();
  };

  onMount(() => {
    keyInputRef.focus();
  });

  return (
    <FloatingFormDropdown
      error={error()}
      footerButtonText="Create"
      footerDisabled={!canCreate()}
      footerLoading={isSaving()}
      onClickOutside={props.onClickOutside ?? props.onClose}
      onFooterClick={() => void handleCreate()}
      parentRef={props.parentRef}
      subtitle={`${label()} key must be unique.${isPage() ? " URL is required for pages." : ""} The new item will be saved in this folder.`}
      title={`Add ${label()}`}
    >
      <KeyInputField
        id="paletteItemKey"
        label="Key"
        onInput={setKey}
        placeholder={`New ${label()} Key`}
        ref={(el) => (keyInputRef = el)}
        value={key()}
      />
      <Show when={isPage()}>
        <As as="div" css={"return `._id { margin-top: 0.75rem; }`;"}>
          <KeyInputField
            id="paletteItemUrl"
            label="URL"
            onInput={(value) => {
              setUrlTouched(true);
              setUrl(value);
            }}
            placeholder="/my-page"
            value={url()}
          />
        </As>
      </Show>
    </FloatingFormDropdown>
  );
}
