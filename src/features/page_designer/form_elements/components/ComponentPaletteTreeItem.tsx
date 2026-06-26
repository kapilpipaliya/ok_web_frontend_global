import { Icon } from "@iconify-icon/solid";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js";

import { componentsMap } from "~/components/form/functions/componentsMap";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import { PlusIconButton } from "~/components/styled/buttons/PlusIconButton";
import { IconButton } from "~/components/styled/IconButton";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { iconMap } from "~/lib/ui/iconMap";
import { generateBoxShadow } from "~/lib/css/generateBoxShadow";
import { getDnDBoxShadowArgs } from "~/features/page_designer/functions/drag_drop/ui/getDnDBoxShadowArgs";
import { onClickAddComponent } from "~/features/page_designer/functions/component/onClickAddComponent";
import {
  bindDragDropRef,
  cleanupDragDropRef,
} from "~/features/page_designer/functions/drag_drop/pragmatic/bindDragDropRef";
import { TreeItemExpandButton } from "~/features/page_designer/settings/layout/TreeItemExpandButton";
import { As } from "~/components/As";
import {
  baseItemStyle,
  buttonStyle,
  createOpenInNewTab,
} from "../common/ItemStyles";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { openInNewInternalTab } from "../pages/functions/openInNewInternalTab";
import {
  attachComponentPaletteTreeDragDrop,
  type ComponentPaletteDropSnapshot,
  type PaletteDropPosition,
} from "./componentPaletteDragDrop";
import {
  COMPONENT_PALETTE_CONFIG,
  isUncategorizedPaletteId,
  type PaletteTreeConfig,
} from "./componentPaletteConfig";
import {
  categoryHasChildren,
  getCategoryChildren,
  getCategoryContentCount,
  getContentChildrenForCategory,
  getItemSortName,
  isPaletteCategory,
  isPaletteContent,
  isPaletteRootCategory,
} from "./componentPaletteUtils";
import { ComponentPreview } from "./ComponentPreview";

export function ComponentPaletteTreeItem(
  props: Readonly<{
    config: PaletteTreeConfig;
    item: Vertex;
    expandedKeys: string[];
    toggleExpand: (itemId: Id) => void;
    parentIndex?: number;
    selectedCompId?: Id | null;
    selectedCategoryId?: Id | null;
    highlightedCompKey?: string | null;
    dropActiveItem?: Id | null;
    dropPosition?: PaletteDropPosition | null;
    setDropState?: (
      activeItemId: Id | null,
      dragPosition: PaletteDropPosition | null,
    ) => void;
    onDrop: (snapshot: ComponentPaletteDropSnapshot) => Promise<void>;
    onSelectCategory?: (categoryId: Id) => void;
    onEditCategory?: (category: Vertex) => void;
    onDeleteCategory?: (category: Vertex) => void;
    onAddSubcategory?: (parentId: Id) => void;
    filterTree?: (vertex: Vertex) => {
      match: boolean;
      matchedChildren: boolean;
    };
    shouldExpandForSearch?: (vertex: Vertex) => boolean;
    searchActive?: boolean;
    isPaletteDragging?: boolean;
    onPaletteDragStart?: () => void;
    onPaletteDragEnd?: () => void;
    itemRef?: (el: HTMLDivElement | undefined) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const [isHovered, setIsHovered] = createSignal(false);
  const [isPreviewOpen, setIsPreviewOpen] = createSignal(false);
  const [isMouseOverItem, setIsMouseOverItem] = createSignal(false);

  const paletteConfig = () => props.config;
  const isComponentPalette = () =>
    paletteConfig().tableVertexLabel === "Component";
  const isPagePalette = () => paletteConfig().tableVertexLabel === "Page";
  const isFunctionPalette = () =>
    paletteConfig().tableVertexLabel === "Function";
  const isEmailTemplatePalette = () =>
    paletteConfig().tableVertexLabel === "EmailTemplate";

  const formStoreVertex = () => {
    const formId = layoutStoreVertex()?.P.formId;
    return formId
      ? (graph.vertexes[formId] as Vertex<FormStoreObject>)
      : undefined;
  };

  const isCategory = () => isPaletteCategory(props.item, paletteConfig());
  const isContentItem = () => isPaletteContent(props.item, paletteConfig());
  const isUncategorized = () =>
    isUncategorizedPaletteId(paletteConfig(), props.item.id);
  const isRootCategory = () =>
    isPaletteRootCategory(props.item, paletteConfig());
  const canManageCategory = () =>
    isCategory() && !isUncategorized() && !isRootCategory();
  const canDeleteCategory = () =>
    canManageCategory() &&
    !categoryHasChildren(graph, setGraph, props.item.id, paletteConfig());

  const categoryChildren = createMemo(() =>
    isCategory() || isUncategorized()
      ? getCategoryChildren(graph, setGraph, props.item.id, paletteConfig())
      : [],
  );

  const contentChildren = createMemo(() =>
    isCategory() || isUncategorized()
      ? getContentChildrenForCategory(
          graph,
          setGraph,
          props.item.id,
          paletteConfig(),
        )
      : [],
  );

  const hasChildren = createMemo(() => {
    if (!(isCategory() || isUncategorized())) return false;
    return categoryHasChildren(graph, setGraph, props.item.id, paletteConfig());
  });

  const contentCount = createMemo(() => {
    if (!(isCategory() || isUncategorized())) return null;
    return getCategoryContentCount(graph, props.item.id, paletteConfig());
  });

  const isExpanded = createMemo(() => {
    if (props.shouldExpandForSearch) {
      return props.shouldExpandForSearch(props.item);
    }
    return props.expandedKeys.includes(props.item.id);
  });

  const isDirectMatch = createMemo(() => {
    if (!(props.searchActive && props.filterTree)) return false;
    return props.filterTree(props.item).match;
  });

  const shouldShowItem = createMemo(() => {
    if (!(props.searchActive && props.filterTree)) return true;
    const r = props.filterTree(props.item);
    return r.match || r.matchedChildren;
  });

  const isSelected = createMemo(() => {
    if (isContentItem()) {
      if (props.selectedCompId && props.item.id === props.selectedCompId) {
        return true;
      }
      const key = props.item.P?.key as string;
      return !!(
        props.highlightedCompKey &&
        key &&
        key === props.highlightedCompKey
      );
    }
    if (isCategory() || isUncategorized()) {
      return props.selectedCategoryId === props.item.id;
    }
    return false;
  });

  const isDropTarget = createMemo(() => {
    return props.dropActiveItem === props.item.id && !!props.dropPosition;
  });

  const contentCursor = () => {
    if (
      (isFunctionPalette() || isEmailTemplatePalette()) &&
      isContentItem()
    ) {
      return "pointer";
    }
    return "grab";
  };

  const getItemStyle = createMemo(() => {
    let boxShadow = "";
    if (isDropTarget() && props.dropPosition) {
      if (props.dropPosition !== "after") {
        const boxShadowProps = getDnDBoxShadowArgs(
          props.dropPosition,
          "${args.theme.var.color.success}",
        );
        boxShadow = `box-shadow:${generateBoxShadow([boxShadowProps])};`;
      }
    }
    if (isSelected()) {
      boxShadow +=
        " background-color:${args.theme.var.color.primary_light_300}; color:${args.theme.var.color.primary_light_300_text};";
    } else if (isHovered()) {
      boxShadow +=
        " background-color:${args.theme.var.color.primary_light_750}; color:${args.theme.var.color.primary_light_750_text};";
    } else if (isNegative(props.item.id)) {
      boxShadow +=
        " background-color:${args.theme.var.color.success_light_600}; color:${args.theme.var.color.success_light_600_text};";
    }
    return [
      baseItemStyle,
      `return \`._id {
        background-color: \${args.theme.var.color.background_light_50};
        color: \${args.theme.var.color.background_light_50_text};
        cursor: ${contentCursor()};
        ${boxShadow}
      }\`;`,
    ];
  });

  const [itemRef, setItemRef] = createSignal<HTMLDivElement>();

  const bindTreeDrag = bindDragDropRef(
    `palette-tree-${props.item.id}`,
    (element) =>
      attachComponentPaletteTreeDragDrop(element, {
        config: paletteConfig(),
        item: props.item,
        setDropState: props.setDropState ?? (() => {}),
        onDrop: props.onDrop,
        onDragStart: props.onPaletteDragStart,
        onDragEnd: props.onPaletteDragEnd,
      }),
  );

  onCleanup(() => {
    cleanupDragDropRef(itemRef());
  });

  createEffect(() => {
    if (!(props.itemRef && isSelected())) return;
    const el = itemRef();
    if (el) props.itemRef(el);
  });

  const getDisplayName = () => getItemSortName(props.item);

  const getIcon = () => {
    if (isCategory()) {
      return isUncategorized() ? "ph:folder-dashed" : "ph:folder";
    }
    if (isFunctionPalette()) {
      return "ph:function";
    }
    if (isEmailTemplatePalette()) {
      return "ph:envelope";
    }
    const key = props.item.P?.key as string;
    return (
      (props.item.P?.icon as string) ||
      (isPagePalette() ? "ph:file" : undefined) ||
      iconMap[key as keyof typeof iconMap] ||
      "ph:puzzle-piece"
    );
  };

  const isMissingComp = createMemo(() => {
    if (!(isContentItem() && isComponentPalette())) return false;
    if (props.item.L?.includes("Component")) return false;
    const key = props.item.P?.key as string;
    return key && !componentsMap[key];
  });

  const handlePreviewOpen = () => {
    setIsPreviewOpen(true);
    setIsHovered(true);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    if (!isMouseOverItem()) setIsHovered(false);
  };

  const handlePageDoubleClick = () => {
    const formStore = formStoreVertex();
    if (!formStore) return;
    onClickAddComponent(
      graph,
      setGraph,
      formStore.P.txnId,
      props.item,
      graph.vertexes[formStore.P.formDataId],
      formStore.P.selectedId === -1
        ? formStore.P.formDataId
        : formStore.P.selectedId,
    );
  };

  const openInNewTab = createOpenInNewTab(
    layoutStoreId,
    props.item,
    graph,
    setGraph,
  );

  const handleFunctionOpen = () => {
    if (!layoutStoreVertex()?.P) return;
    openInNewInternalTab(layoutStoreId, props.item, graph, setGraph);
  };

  const shouldShowButtons = () =>
    !props.isPaletteDragging &&
    isContentItem() &&
    (isComponentPalette() ||
      isPagePalette() ||
      isFunctionPalette() ||
      isEmailTemplatePalette()) &&
    (isHovered() || isPreviewOpen());

  return (
    <Show when={shouldShowItem()}>
      <As
        as="li"
        css={`return \`._id {
  list-style: none;
  margin: 0;
  padding: 0;
}\`;`}
      >
        <As
          as="div"
          css={getItemStyle()}
          onMouseEnter={() => {
            setIsHovered(true);
            setIsMouseOverItem(true);
          }}
          onMouseLeave={() => {
            setIsMouseOverItem(false);
            if (!isPreviewOpen()) setIsHovered(false);
          }}
          onDblClick={() => {
            if (isPagePalette() && isContentItem()) {
              handlePageDoubleClick();
            }
          }}
          onClick={() => {
            if (isCategory() || isUncategorized()) {
              props.onSelectCategory?.(props.item.id);
              return;
            }
            if (isFunctionPalette() && isContentItem()) {
              handleFunctionOpen();
            }
            if (isEmailTemplatePalette() && isContentItem()) {
              handleFunctionOpen();
            }
          }}
          ref={(el) => {
            setItemRef(el);
            bindTreeDrag(el);
          }}
        >
          <As
            as="div"
            css={[
              isDirectMatch() ? "return `._id { font-weight: bold; }`;" : "",
              `return \`._id {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  ${hasChildren() ? "" : "padding-left: 24px;"}
}\`;`,
            ]}
          >
            <TreeItemExpandButton
              hasChildren={hasChildren()}
              isCollapsed={!isExpanded()}
              metaVertexId={props.item.id}
              toggleExpand={props.toggleExpand}
            />
            <Icon height={17} icon={getIcon()} width={17} noobserver />
            <As
              as="span"
              css={[
                isMissingComp()
                  ? "return `._id { color: ${args.theme.var.color.error}; }`;"
                  : "",
                `return \`._id {
  flex: 1;
  font-size: 0.82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}\`;`,
              ]}
            >
              {getDisplayName()}
            </As>
            <Show when={isCategory() || isUncategorized()}>
              <As
                as="span"
                css={`return \`._id {
  font-size: 0.7rem;
  opacity: 0.6;
}\`;`}
              >
                {contentCount() ?? ""}
              </As>
            </Show>
            <Show when={canManageCategory() && isHovered()}>
              <As
                as="span"
                css={"return `._id { display: flex; gap: 2px; }`;"}
                onClick={(e) => e.stopPropagation()}
              >
                <IconButton
                  css={buttonStyle}
                  icon="ph:pencil-simple"
                  onClick={() => props.onEditCategory?.(props.item)}
                  size={14}
                  title="Rename category"
                />
                <Show when={canDeleteCategory()}>
                  <IconButton
                    css={buttonStyle}
                    icon="ph:trash"
                    onClick={() => props.onDeleteCategory?.(props.item)}
                    size={14}
                    title="Delete category"
                  />
                </Show>
                <PlusIconButton
                  ariaLabel="Add subcategory"
                  onClick={() => props.onAddSubcategory?.(props.item.id)}
                />
              </As>
            </Show>
            <Show when={shouldShowButtons()}>
              <Show when={isComponentPalette() || isPagePalette()}>
                <ComponentPreview
                  disabled={props.isPaletteDragging}
                  item={props.item}
                  onPreviewClose={handlePreviewClose}
                  onPreviewOpen={handlePreviewOpen}
                />
              </Show>
              <Show
                when={
                  isComponentPalette() ||
                  isPagePalette() ||
                  isFunctionPalette() ||
                  isEmailTemplatePalette()
                }
              >
                <IconButton
                  css={buttonStyle}
                  icon="ph:arrow-square-out"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFunctionPalette() || isEmailTemplatePalette()) {
                      handleFunctionOpen();
                    } else {
                      openInNewTab();
                    }
                  }}
                  size={16}
                  title="Open in new tab"
                />
              </Show>
            </Show>
          </As>
        </As>

        <Show when={isExpanded() && hasChildren()}>
          <As
            as="ul"
            css={`return \`._id {
  list-style: none;
  margin: 0;
  padding: 0 0 0 12px;
}\`;`}
          >
            <For each={categoryChildren()}>
              {(child) => (
                <ComponentPaletteTreeItem
                  config={props.config}
                  dropActiveItem={props.dropActiveItem}
                  dropPosition={props.dropPosition}
                  expandedKeys={props.expandedKeys}
                  filterTree={props.filterTree}
                  highlightedCompKey={props.highlightedCompKey}
                  isPaletteDragging={props.isPaletteDragging}
                  item={child}
                  itemRef={props.itemRef}
                  onAddSubcategory={props.onAddSubcategory}
                  onDeleteCategory={props.onDeleteCategory}
                  onDrop={props.onDrop}
                  onEditCategory={props.onEditCategory}
                  onPaletteDragEnd={props.onPaletteDragEnd}
                  onPaletteDragStart={props.onPaletteDragStart}
                  onSelectCategory={props.onSelectCategory}
                  parentIndex={(props.parentIndex ?? 0) + 1}
                  searchActive={props.searchActive}
                  selectedCategoryId={props.selectedCategoryId}
                  selectedCompId={props.selectedCompId}
                  setDropState={props.setDropState}
                  shouldExpandForSearch={props.shouldExpandForSearch}
                  toggleExpand={props.toggleExpand}
                />
              )}
            </For>
            <For each={contentChildren()}>
              {(child) => (
                <ComponentPaletteTreeItem
                  config={props.config}
                  dropActiveItem={props.dropActiveItem}
                  dropPosition={props.dropPosition}
                  expandedKeys={props.expandedKeys}
                  filterTree={props.filterTree}
                  highlightedCompKey={props.highlightedCompKey}
                  isPaletteDragging={props.isPaletteDragging}
                  item={child}
                  itemRef={props.itemRef}
                  onAddSubcategory={props.onAddSubcategory}
                  onDeleteCategory={props.onDeleteCategory}
                  onDrop={props.onDrop}
                  onEditCategory={props.onEditCategory}
                  onPaletteDragEnd={props.onPaletteDragEnd}
                  onPaletteDragStart={props.onPaletteDragStart}
                  onSelectCategory={props.onSelectCategory}
                  parentIndex={(props.parentIndex ?? 0) + 1}
                  searchActive={props.searchActive}
                  selectedCategoryId={props.selectedCategoryId}
                  selectedCompId={props.selectedCompId}
                  setDropState={props.setDropState}
                  shouldExpandForSearch={props.shouldExpandForSearch}
                  toggleExpand={props.toggleExpand}
                />
              )}
            </For>
          </As>
        </Show>

        <Show when={isDropTarget() && props.dropPosition === "after"}>
          <As
            as="div"
            css={`return \`._id {
  height: 2px;
  background: \${args.theme.var.color.primary};
  margin: 1px 0;
}\`;`}
          />
        </Show>
      </As>
    </Show>
  );
}
