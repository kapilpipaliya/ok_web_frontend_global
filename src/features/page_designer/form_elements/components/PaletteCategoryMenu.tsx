import { createSignal, onSettled } from "solid-js";

import { FloatingFormDropdown } from "~/components/styled/dialog/FloatingFormDropdown";
import { KeyInputField } from "~/components/styled/dialog/KeyInputField";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import type { PaletteTreeConfig } from "~/features/page_designer/form_elements/components/componentPaletteConfig";
import { savePaletteCategory } from "~/features/page_designer/form_elements/components/componentPaletteApi";
import { validatePaletteCategoryUnique } from "~/features/page_designer/form_elements/components/validatePaletteCategoryUnique";
import { getItemSortName } from "~/features/page_designer/form_elements/components/componentPaletteUtils";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function PaletteCategoryMenu(props: {
  config: PaletteTreeConfig;
  mode: "add" | "edit";
  parentRef: HTMLElement;
  parentId?: string | null;
  category?: Vertex;
  onClose: () => void;
  onClickOutside?: () => void;
  onSaved?: (info: {
    mode: "add" | "edit";
    categoryId: Id | null;
    parentId: string | null;
  }) => void;
}) {
  let nameInputRef!: HTMLInputElement;
  const [graph, setGraph] = useGraph();
  const [name, setName] = createSignal(
    props.mode === "edit" && props.category
      ? getItemSortName(props.category)
      : "",
  );
  const [key, setKey] = createSignal(
    props.mode === "edit" && props.category
      ? String(props.category.P?.key ?? "")
      : "",
  );
  const [error, setError] = createSignal("");
  const [isSaving, setIsSaving] = createSignal(false);
  const { showSuccessToast, showErrorToast } = useToast();

  const canSave = () => !!name().trim();

  const handleSave = async () => {
    if (isSaving() || !canSave()) {
      return;
    }

    const trimmedName = name().trim();
    const trimmedKey =
      key().trim() || trimmedName.toLowerCase().replace(/\s+/g, "_");
    const editingId = props.mode === "edit" ? props.category?.id : null;

    const validation = validatePaletteCategoryUnique(graph, props.config, {
      name: trimmedName,
      key: trimmedKey,
      excludeVertexId: editingId ?? null,
    });
    if (!validation.valid) {
      setError(validation.message);
      showErrorToast(validation.message);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const result = await savePaletteCategory(graph, setGraph, props.config, {
        vertexId: editingId ?? undefined,
        name: trimmedName,
        key: trimmedKey,
        parentId: props.parentId,
      });

      if (result.result?.success) {
        showSuccessToast(
          result.result.message ||
            (props.mode === "edit" ? "Category updated" : "Category created"),
        );
        props.onSaved?.({
          mode: props.mode,
          categoryId: editingId ?? null,
          parentId: props.parentId ?? null,
        });
        props.onClose();
        return;
      }

      const message =
        result.result?.message ||
        (props.mode === "edit"
          ? "Failed to update category"
          : "Failed to create category");
      setError(message);
      showErrorToast(message);
    } finally {
      setIsSaving(false);
    }
  };

  onSettled(() => {
    nameInputRef.focus();
  });

  return (
    <FloatingFormDropdown
      error={error()}
      footerButtonText={props.mode === "edit" ? "Save" : "Create"}
      footerDisabled={!canSave()}
      footerLoading={isSaving()}
      onClickOutside={props.onClickOutside ?? props.onClose}
      onFooterClick={() => void handleSave()}
      parentRef={props.parentRef}
      subtitle={
        props.mode === "edit"
          ? "Update the category name or key."
          : "Category name must be unique. Key is optional and defaults from the name."
      }
      title={props.mode === "edit" ? "Edit Category" : "Add Category"}
    >
      <KeyInputField
        disabled={isSaving()}
        id="paletteCategoryName"
        label="Name"
        onInput={setName}
        placeholder="Category name"
        ref={(el) => (nameInputRef = el)}
        value={name()}
      />
      <As as="div" css={"return `._id { margin-top: 0.75rem; }`;"}>
        <KeyInputField
          disabled={isSaving()}
          id="paletteCategoryKey"
          label="Key"
          onInput={setKey}
          placeholder="Category key (optional)"
          value={key()}
        />
      </As>
    </FloatingFormDropdown>
  );
}
