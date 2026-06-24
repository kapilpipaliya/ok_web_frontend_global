import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import { createStore } from "solid-js/store";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { SearchBar } from "~/components/styled/SearchBar";
import { useToast } from "~/components/styled/modal/Toast";
import { PlusIconButton } from "~/components/styled/buttons/PlusIconButton";
import { As } from "~/components/As";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { scrollElementIntoContainer } from "~/lib/dom/scrollElementIntoContainer";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { PAGE_DESIGNER_DRAG_TYPES } from "~/features/page_designer/functions/drag_drop/pragmatic/pageDesignerDragTypes";
import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";

import { ComponentPaletteTreeItem } from "./ComponentPaletteTreeItem";
import {
  fetchCategoryChildren,
  fetchPaletteTree,
  moveContentToCategory,
  movePaletteCategory,
  reorderPaletteSiblings,
  savePaletteCategory,
  deletePaletteCategory,
  getPaletteServerError,
  isPaletteServerSuccess,
} from "./componentPaletteApi";
import type {
  ComponentPaletteDropSnapshot,
  PaletteDropPosition,
} from "./componentPaletteDragDrop";
import {
  COMPONENT_PALETTE_CONFIG,
  getUncategorizedPaletteId,
  isUncategorizedPaletteId,
  type PaletteTreeConfig,
} from "./componentPaletteConfig";
import {
  filterPaletteTreeVertex,
  getAncestorCategoryIds,
  getCategoryChildren,
  getContentChildrenForCategory,
  getItemSortName,
  getPaletteRootItems,
  categoryHasChildren,
  isPaletteCategory,
  isPaletteContent,
} from "./componentPaletteUtils";

export function ComponentPaletteTree(props?: {
  compact?: boolean;
  config?: PaletteTreeConfig;
  onCompDoubleClick?: (comp: Vertex) => void;
  searchAlways?: boolean;
  title?: string;
}) {
  const paletteConfig = () => props?.config ?? COMPONENT_PALETTE_CONFIG;
  const isComponentPalette = () =>
    paletteConfig().tableVertexLabel === "Component";
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId!]?.P as PageLayoutObject) || {};
  const { showErrorToast, showSuccessToast, showWarningToast } = useToast();

  const [isLoading, setIsLoading] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [expandedKeys, setExpandedKeys] = createStore<string[]>([]);
  const [selectedCompId, setSelectedCompId] = createSignal<Id | null>(null);
  const [localSelectedCategoryId, setLocalSelectedCategoryId] =
    createSignal<Id | null>(null);
  const [scrollRef, setScrollRef] = createSignal<HTMLDivElement>();

  const [categoryModalMode, setCategoryModalMode] = createSignal<
    "add" | "edit" | null
  >(null);
  const [editingCategoryId, setEditingCategoryId] = createSignal<Id | null>(
    null,
  );
  const [addParentId, setAddParentId] = createSignal<string | null>(null);
  const [categoryName, setCategoryName] = createSignal("");
  const [categoryKey, setCategoryKey] = createSignal("");
  const [dropActiveItem, setDropActiveItem] = createSignal<Id | null>(null);
  const [dropPosition, setDropPosition] =
    createSignal<PaletteDropPosition | null>(null);
  const [isPaletteDragging, setIsPaletteDragging] = createSignal(false);

  let dropInFlight = false;

  const setDropState = (
    activeItemId: Id | null,
    position: PaletteDropPosition | null,
  ) => {
    if (dropActiveItem() === activeItemId && dropPosition() === position) {
      return;
    }
    setDropActiveItem(activeItemId);
    setDropPosition(position);
  };

  function normalizeReorderParentId(parentId: Id | null): string | null {
    if (!parentId || isUncategorizedPaletteId(paletteConfig(), parentId)) {
      return null;
    }
    return parentId;
  }

  function getContentParentCategoryId(itemId: Id): string | null {
    return normalizeReorderParentId(getParentCategoryId(itemId));
  }

  function getSiblingsParentKey(
    parentCategoryId: string | null,
  ): string | null {
    return parentCategoryId ?? getUncategorizedPaletteId(paletteConfig());
  }

  const selectedCategoryId = () =>
    isComponentPalette()
      ? layoutStore().selectedComponentCategoryId
      : localSelectedCategoryId();

  const setSelectedCategoryId = (categoryId: Id) => {
    if (isComponentPalette()) {
      mergeVertexProperties<PageLayoutObject>(
        0,
        layoutStoreId,
        graph,
        setGraph,
        { selectedComponentCategoryId: categoryId },
      );
      return;
    }
    setLocalSelectedCategoryId(categoryId);
  };

  function closeCategoryModal() {
    setCategoryModalMode(null);
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryKey("");
    setAddParentId(null);
  }

  function openAddCategoryModal(parentId: string | null = null) {
    setCategoryModalMode("add");
    setEditingCategoryId(null);
    setAddParentId(parentId ?? selectedCategoryId());
    setCategoryName("");
    setCategoryKey("");
  }

  function openEditCategoryModal(category: Vertex) {
    setCategoryModalMode("edit");
    setEditingCategoryId(category.id);
    setCategoryName(getItemSortName(category));
    setCategoryKey(String(category.P?.key ?? ""));
    setAddParentId(getParentCategoryId(category.id));
  }

  const rootItems = createMemo(() =>
    getPaletteRootItems(graph, paletteConfig()),
  );

  const searchActive = createMemo(() => !!searchQuery().trim());

  const filterTree = (vertex: Vertex) =>
    filterPaletteTreeVertex(
      graph,
      setGraph,
      vertex,
      searchQuery(),
      paletteConfig(),
    );

  const shouldExpandForSearch = (vertex: Vertex) => {
    if (!searchActive()) return expandedKeys.includes(vertex.id);
    const r = filterTree(vertex);
    return r.match || r.matchedChildren;
  };

  const getFilteredRoots = createMemo(() => {
    if (!searchActive()) return rootItems();
    return rootItems().filter((r) => {
      const x = filterTree(r);
      return x.match || x.matchedChildren;
    });
  });

  async function loadTree() {
    setIsLoading(true);
    try {
      const result = await fetchPaletteTree(graph, setGraph, paletteConfig());
      if (result.error) {
        showErrorToast(result.error);
        return;
      }
      const rootCategory = findVertexByLabelAndUniqueId(
        graph,
        paletteConfig().parentVertexLabel,
        "key",
        paletteConfig().rootKeys.key,
      );
      setExpandedKeys((keys) => [
        ...new Set([...keys, getUncategorizedPaletteId(paletteConfig())]),
      ]);
      if (rootCategory) {
        setExpandedKeys((keys) => [...new Set([...keys, rootCategory.id])]);
        if (!selectedCategoryId()) {
          setSelectedCategoryId(rootCategory.id);
        }
      }
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }

  onMount(() => {
    void loadTree();
  });

  function toggleExpand(itemId: Id) {
    const isExpanded = expandedKeys.includes(itemId);
    if (isExpanded) {
      setExpandedKeys((prev) => prev.filter((id) => id !== itemId));
      return;
    }
    setExpandedKeys((prev) => [...prev, itemId]);
    if (
      !(paletteConfig().loadFullTree ||isUncategorizedPaletteId(paletteConfig(), itemId) ) &&
      isPaletteCategory(graph.vertexes[itemId], paletteConfig())
    ) {
      void fetchCategoryChildren(graph, setGraph, paletteConfig(), itemId);
    }
  }

  function getParentCategoryId(itemId: Id): string | null {
    const vertex = graph.vertexes[itemId];
    if (!vertex) return null;
    const edgeIds = vertex.OUT?.[paletteConfig().toParentEdgeType];
    if (!edgeIds?.length) return null;
    const parent = graph.vertexes[graph.edges[edgeIds[0]]?.E];
    return parent?.id ?? null;
  }

  function getSiblings(
    itemId: Id,
    parentCategoryId: string | null,
    vertexLabel: string,
  ) {
    if (isUncategorizedPaletteId(paletteConfig(), parentCategoryId)) {
      return getContentChildrenForCategory(
        graph,
        setGraph,
        parentCategoryId!,
        paletteConfig(),
      );
    }
    if (!parentCategoryId) {
      return getPaletteRootItems(graph, paletteConfig()).filter(
        (item) =>
          item.L?.includes(vertexLabel) &&
          !isUncategorizedPaletteId(paletteConfig(), item.id),
      );
    }
    if (vertexLabel === paletteConfig().parentVertexLabel) {
      return getCategoryChildren(
        graph,
        setGraph,
        parentCategoryId,
        paletteConfig(),
      );
    }
    return getContentChildrenForCategory(
      graph,
      setGraph,
      parentCategoryId,
      paletteConfig(),
    );
  }

  function computeReorderedIds(
    siblings: Vertex[],
    sourceId: Id,
    targetId: Id,
    position: "before" | "after",
  ) {
    const withoutSource = siblings
      .map((s) => s.id)
      .filter((id) => id !== sourceId);
    const targetIndex = withoutSource.indexOf(targetId);
    if (targetIndex < 0) return [...withoutSource, sourceId];
    const insertAt = position === "before" ? targetIndex : targetIndex + 1;
    return [
      ...withoutSource.slice(0, insertAt),
      sourceId,
      ...withoutSource.slice(insertAt),
    ];
  }

  async function handlePaletteDrop(snapshot: ComponentPaletteDropSnapshot) {
    if (dropInFlight) return;
    dropInFlight = true;
    setIsPaletteDragging(false);

    const { sourceType, sourceId, activeItemId, dragPosition } = snapshot;
    const target = graph.vertexes[activeItemId];
    if (!target) {
      dropInFlight = false;
      return;
    }

    try {
      if (sourceType === PAGE_DESIGNER_DRAG_TYPES.PALETTE_CATEGORY) {
        if (
          dragPosition === "center" &&
          isPaletteCategory(target, paletteConfig())
        ) {
          const newParentId = isUncategorizedPaletteId(
            paletteConfig(),
            target.id,
          )
            ? null
            : target.id;
          const result = await movePaletteCategory(
            graph,
            setGraph,
            paletteConfig(),
            sourceId,
            newParentId,
          );
          if (isPaletteServerSuccess(result)) {
            showSuccessToast(result.result.message || "Category moved");
            if (newParentId) setExpandedKeys((k) => [...k, newParentId]);
          } else {
            showErrorToast(
              getPaletteServerError(result, "Failed to move category"),
            );
          }
          return;
        }

        if (
          (dragPosition === "before" || dragPosition === "after") &&
          isPaletteCategory(target, paletteConfig())
        ) {
          const parentId = getParentCategoryId(target.id);
          const siblings = getSiblings(
            target.id,
            parentId,
            paletteConfig().parentVertexLabel,
          );
          const orderedIds = computeReorderedIds(
            siblings,
            sourceId,
            target.id,
            dragPosition,
          );
          const result = await reorderPaletteSiblings(
            graph,
            setGraph,
            paletteConfig(),
            {
              orderedItemIds: orderedIds,
              parentCategoryId: normalizeReorderParentId(parentId),
              vertexLabel: paletteConfig().parentVertexLabel,
            },
          );
          if (isPaletteServerSuccess(result)) {
            showSuccessToast("Category order saved");
          } else {
            showErrorToast(getPaletteServerError(result, "Failed to reorder"));
          }
        }
        return;
      }

      if (
        sourceType === PAGE_DESIGNER_DRAG_TYPES.PALETTE_CONTENT_ITEM ||
        sourceType === PAGE_DESIGNER_DRAG_TYPES.PALETTE_PAGE
      ) {
        if (
          dragPosition === "center" &&
          (isPaletteCategory(target, paletteConfig()) ||
            isUncategorizedPaletteId(paletteConfig(), target.id))
        ) {
          const categoryId = isUncategorizedPaletteId(
            paletteConfig(),
            target.id,
          )
            ? null
            : target.id;
          const result = await moveContentToCategory(
            graph,
            setGraph,
            paletteConfig(),
            [sourceId],
            categoryId,
          );
          if (isPaletteServerSuccess(result)) {
            showSuccessToast(result.result.message || "Item moved");
            if (categoryId) setExpandedKeys((k) => [...k, categoryId]);
          } else {
            showErrorToast(
              getPaletteServerError(result, "Failed to move item"),
            );
          }
          return;
        }

        if (
          (dragPosition === "before" || dragPosition === "after") &&
          isPaletteContent(target, paletteConfig())
        ) {
          const targetParentId = getContentParentCategoryId(target.id);
          const sourceParentId = getContentParentCategoryId(sourceId);

          if (sourceParentId !== targetParentId) {
            const moveResult = await moveContentToCategory(
              graph,
              setGraph,
              paletteConfig(),
              [sourceId],
              targetParentId,
            );
            if (!isPaletteServerSuccess(moveResult)) {
              showErrorToast(
                getPaletteServerError(moveResult, "Failed to move item"),
              );
              return;
            }
            if (targetParentId) {
              setExpandedKeys((k) => [...k, targetParentId]);
            }
          }

          const siblings = getSiblings(
            target.id,
            getSiblingsParentKey(targetParentId),
            paletteConfig().tableVertexLabel,
          );
          const orderedIds = computeReorderedIds(
            siblings,
            sourceId,
            target.id,
            dragPosition,
          );
          const result = await reorderPaletteSiblings(
            graph,
            setGraph,
            paletteConfig(),
            {
              orderedItemIds: orderedIds,
              parentCategoryId: targetParentId,
              vertexLabel: paletteConfig().tableVertexLabel,
            },
          );
          if (isPaletteServerSuccess(result)) {
            showSuccessToast("Order saved");
          } else {
            showErrorToast(getPaletteServerError(result, "Failed to reorder"));
          }
        }
      }
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : String(e));
    } finally {
      dropInFlight = false;
    }
  }

  async function handleSaveCategory() {
    const name = categoryName().trim();
    const key = categoryKey().trim() || name.toLowerCase().replace(/\s+/g, "_");
    if (!name) {
      showErrorToast("Category name is required");
      return;
    }

    const mode = categoryModalMode();
    const editingId = editingCategoryId();
    const result = await savePaletteCategory(graph, setGraph, paletteConfig(), {
      vertexId: mode === "edit" ? editingId : undefined,
      name,
      key,
      parentId:
        mode === "edit" && editingId
          ? getParentCategoryId(editingId)
          : addParentId(),
    });

    if (result.result?.success) {
      showSuccessToast(
        result.result.message ||
          (mode === "edit" ? "Category updated" : "Category created"),
      );
      closeCategoryModal();
      const parentId =
        mode === "edit" && editingId
          ? getParentCategoryId(editingId)
          : addParentId();
      if (parentId) {
        setExpandedKeys((k) => [...k, parentId]);
        setSelectedCategoryId(parentId);
      }
      if (mode === "edit" && editingId) {
        setSelectedCategoryId(editingId);
      }
    } else {
      showErrorToast(
        result.result?.message ||
          (mode === "edit"
            ? "Failed to update category"
            : "Failed to create category"),
      );
    }
  }

  async function handleDeleteCategory(category: Vertex) {
    if (categoryHasChildren(graph, setGraph, category.id, paletteConfig())) {
      showWarningToast(
        "Cannot delete category with items. Remove all items first.",
      );
      return;
    }

    const name = getItemSortName(category);
    if (
      !window.confirm(
        `Delete category "${name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    const result = await deletePaletteCategory(
      graph,
      setGraph,
      paletteConfig(),
      category.id,
    );

    if (isPaletteServerSuccess(result)) {
      showSuccessToast(result.result?.message || "Category deleted");
      if (selectedCategoryId() === category.id) {
        const rootCategory = findVertexByLabelAndUniqueId(
          graph,
          paletteConfig().parentVertexLabel,
          "key",
          paletteConfig().rootKeys.key,
        );
        if (rootCategory) {
          setSelectedCategoryId(rootCategory.id);
        } else if (isComponentPalette()) {
          mergeVertexProperties<PageLayoutObject>(
            0,
            layoutStoreId,
            graph,
            setGraph,
            { selectedComponentCategoryId: null },
          );
        } else {
          setLocalSelectedCategoryId(null);
        }
      }
    } else {
      showErrorToast(
        getPaletteServerError(result, "Failed to delete category"),
      );
    }
  }

  createEffect(() => {
    if (!isComponentPalette()) return;
    const highlightedKey = layoutStore().highlightedCompKey;
    if (!highlightedKey) {
      setSelectedCompId(null);
      return;
    }
    const comp = findVertexByLabelAndUniqueId(
      graph,
      paletteConfig().tableVertexLabel,
      "key",
      highlightedKey,
    );
    if (!comp) return;

    setSelectedCompId(comp.id);
    const ancestors = getAncestorCategoryIds(graph, comp.id, paletteConfig());
    const uncategorizedId = getUncategorizedPaletteId(paletteConfig());
    setExpandedKeys((keys) => {
      const next = new Set(keys);
      let changed = false;
      for (const id of [...ancestors, uncategorizedId]) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      return changed ? [...next] : keys;
    });

    const container = scrollRef();
    if (!container) return;

    // Re-run scroll after category expansion renders the selected row.
    void expandedKeys;
    void selectedCompId();

    queueMicrotask(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const selected = container.querySelector<HTMLElement>(
            "[data-palette-selected='true']",
          );
          if (selected) {
            scrollElementIntoContainer(selected, container, {
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 50);
      });
    });
  });

  let selectedEl: HTMLDivElement | undefined;
  const setSelectedItemRef = (el: HTMLDivElement | undefined) => {
    if (selectedEl && selectedEl !== el) {
      selectedEl.removeAttribute("data-palette-selected");
    }
    if (el) {
      el.setAttribute("data-palette-selected", "true");
      selectedEl = el;
    } else if (!el) {
      selectedEl = undefined;
    }
  };

  return (
    <As as="div" ref={setScrollRef}>
      <Show when={!props?.compact}>
        <As
          as="div"
          css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
  background-color: \${args.theme.var.color.background_light_150};
  padding: 4px 0;
}\`;`}
        >
          <As
            as="div"
            css={`return \`._id {
  padding: 6px;
  font-weight: 500;
  font-size: 0.82rem;
}\`;`}
          >
            {props?.title ?? "Categories"}
          </As>
          <PlusIconButton
            ariaLabel="Add category"
            onClick={() => openAddCategoryModal(null)}
          />
        </As>
      </Show>

      <Show
        when={
          props?.searchAlways || rootItems().length >= 5 || searchQuery().trim()
        }
      >
        <SearchBar
          handleChange={setSearchQuery}
          placeholder={`Search ${paletteConfig().tableVertexLabel.toLowerCase()}s...`}
          value={searchQuery()}
        />
      </Show>

      <Show fallback={<LoaderNew loaderHeight="55vh" />} when={!isLoading()}>
        <As
          as="ul"
          css={`return \`._id {
  list-style: none;
  margin: 0;
  padding: 0;
}\`;`}
        >
          <For each={getFilteredRoots()}>
            {(item) => (
              <ComponentPaletteTreeItem
                config={paletteConfig()}
                dropActiveItem={dropActiveItem()}
                dropPosition={dropPosition()}
                expandedKeys={expandedKeys}
                filterTree={filterTree}
                highlightedCompKey={layoutStore().highlightedCompKey}
                isPaletteDragging={isPaletteDragging()}
                item={item}
                itemRef={setSelectedItemRef}
                onAddSubcategory={(parentId) => openAddCategoryModal(parentId)}
                onDeleteCategory={(category) =>
                  void handleDeleteCategory(category)
                }
                onDrop={handlePaletteDrop}
                onEditCategory={openEditCategoryModal}
                onPaletteDragEnd={() => setIsPaletteDragging(false)}
                onPaletteDragStart={() => setIsPaletteDragging(true)}
                onSelectCategory={setSelectedCategoryId}
                searchActive={searchActive()}
                selectedCategoryId={selectedCategoryId()}
                selectedCompId={selectedCompId()}
                setDropState={setDropState}
                shouldExpandForSearch={shouldExpandForSearch}
                toggleExpand={toggleExpand}
              />
            )}
          </For>
        </As>
      </Show>

      <Show when={categoryModalMode()}>
        <As
          as="div"
          css={`return \`._id {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}\`;`}
          onClick={closeCategoryModal}
        >
          <As
            as="div"
            css={`return \`._id {
  background: \${args.theme.var.color.background};
  border-radius: 8px;
  padding: 1rem;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}\`;`}
            onClick={(e) => e.stopPropagation()}
          >
            <As
              as="h3"
              css={"return `._id { margin: 0; font-size: 1rem; }`;"}
            >
              {categoryModalMode() === "edit"
                ? "Edit Category"
                : "Add Category"}
            </As>
            <input
              placeholder="Name"
              value={categoryName()}
              onInput={(e) => setCategoryName(e.currentTarget.value)}
            />
            <input
              placeholder="Key (optional)"
              value={categoryKey()}
              onInput={(e) => setCategoryKey(e.currentTarget.value)}
            />
            <As
              as="div"
              css={"return `._id { display: flex; gap: 0.5rem; justify-content: flex-end; }`;"}
            >
              <button type="button" onClick={closeCategoryModal}>
                Cancel
              </button>
              <button type="button" onClick={() => void handleSaveCategory()}>
                Save
              </button>
            </As>
          </As>
        </As>
      </Show>
    </As>
  );
}
