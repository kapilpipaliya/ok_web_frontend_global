import { createSignal, For, Show } from "solid-js";
import { Icon } from "@iconify-icon/solid";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { useGraph } from "~/lib/graph/GraphContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { evalExpression } from "~/lib/expression_eval";

import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
  type PageLayoutObject
} from "../../context/LayoutContext";
import { LayoutTreeItem } from "./LayoutTreeItem";
import { IconButton } from "~/components/styled/IconButton";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import { getChildrenAttrs } from "../../functions/layout/getChildrenAttrs";
import { toggleHidden } from "./HideShowIcon";

export function LayoutTree() {
  const [graph, setGraph] = useGraph();
  const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);
  const [treeRef, setTreeRef] = createSignal<HTMLElement>();

  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();
  
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
    
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  function toggleExpand(itemId: Id) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }

  const rootVertexes = () => {
    return formStoreVertex()?.P.formDataId
      ? graph.vertexes[formStoreVertex()?.P.formDataId]
        ? [graph.vertexes[formStoreVertex()?.P.formDataId]]
        : []
      : [];
  };
  
  const toggleAllJsonEditors = () => {
    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreId!,
      graph,
      setGraph,
      {
        showAllJsonEditors: !(formStoreVertex()?.P.showAllJsonEditors ?? false)
      }
    );
  };

  const jsonTooltip = () => (formStoreVertex()?.P.showAllJsonEditors ?? false) 
    ? "Hide all JSON editors" 
    : "Show all JSON editors";

  // Focus the currently selected item
  const focusSelectedItem = () => {
    const currentSelectedId = formStoreVertex()?.P.selectedId;
    if (!currentSelectedId) return;
    
    const treeElement = treeRef();
    if (!treeElement) return;
    
    // Short delay to ensure the DOM has updated
    setTimeout(() => {
      const selectedElement = treeElement.querySelector(`[data-item-id="${currentSelectedId}"]`) as HTMLElement;
      if (selectedElement) {
        selectedElement.focus();
      }
    }, 10);
  };

  // Handle keyboard navigation with DOM-based approach
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '\\', 'Enter'].includes(e.key)) return;
    
    e.preventDefault();
    
    const currentSelectedId = formStoreVertex()?.P.selectedId;
    if (!currentSelectedId) return;
    
    // Find all selectable tree items in the DOM
    const treeElement = treeRef();
    if (!treeElement) return;

    // Handle backslash key to toggle visibility
    if (e.key === '\\') {
      const itemId = String(currentSelectedId);
      const vertex = graph.vertexes[itemId];
      if (!vertex) return;
      
      // Call toggleHidden from HideShowIcon
      toggleHidden(itemId as Id, formStoreId!, graph, setGraph);
      return;
    }

    // Handle Enter key to toggle JSON editor
    if (e.key === 'Enter') {
      // Get the current item's JSON editor state
      const itemId = String(currentSelectedId);
      const vertex = graph.vertexes[itemId];
      if (!vertex) return;

      // Toggle JSON editor for the selected item
      // We'll need to get a reference to the item to click its JSON button
      const selectedElement = treeElement.querySelector(`[data-item-id="${currentSelectedId}"]`);
      if (selectedElement) {
        // Find the JSON button within this element
        const jsonButton = selectedElement.querySelector('[icon="tabler:json"]') as HTMLElement;
        if (jsonButton) {
          jsonButton.click();
        }
      }
      
      // Focus the item after toggling
      focusSelectedItem();
      return;
    }
    
    const itemElements = treeElement.querySelectorAll('[data-item-id]');
    if (itemElements.length === 0) return;
    
    // Find the currently selected element
    const currentElementIndex = Array.from(itemElements).findIndex(
      el => el.getAttribute('data-item-id') === String(currentSelectedId)
    );
    
    if (currentElementIndex === -1) return;
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Vertical navigation
      let newIndex;
      if (e.key === 'ArrowUp') {
        // Move to previous visible item
        newIndex = currentElementIndex > 0 ? currentElementIndex - 1 : itemElements.length - 1;
      } else {
        // Move to next visible item
        newIndex = currentElementIndex < itemElements.length - 1 ? currentElementIndex + 1 : 0;
      }
      
      const nextItemId = itemElements[newIndex].getAttribute('data-item-id');
      if (nextItemId) {
        onLayoutItemClick(
          layoutStoreVertex(),
          formStoreVertex(),
          nextItemId,
          graph,
          setGraph,
        );
        
        // Focus the newly selected item
        focusSelectedItem();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Horizontal navigation - expand/collapse
      const itemId = String(currentSelectedId);
      
      // Check if the item has children
      const vertex = graph.vertexes[itemId];
      if (!vertex) return;
      
      const hasChildren = getChildrenAttrs(graph, setGraph, vertex).length > 0;
      
      if (e.key === 'ArrowLeft') {
        const isExpanded = !collapsedKeys().includes(itemId as Id);
        
        if (isExpanded && hasChildren) {
          // Collapse if expanded
          toggleExpand(itemId as Id);
          
          // Focus the current item after collapsing
          focusSelectedItem();
        } else {
          // If already collapsed or no children, try to move to parent
          // Use evalExpression directly to get the parent since getChildrenAttrs doesn't support a parent parameter
          const parentElements = evalExpression("<-Attr", { graph, vertexes: [vertex] }) || [];
          
          if (parentElements && parentElements.length > 0) {
            onLayoutItemClick(
              layoutStoreVertex(),
              formStoreVertex(),
              parentElements[0].id,
              graph,
              setGraph,
            );
            
            // Focus the parent item
            focusSelectedItem();
          } else {
            // Make sure we maintain focus on the current item if there's no parent
            focusSelectedItem();
          }
        }
      } else if (e.key === 'ArrowRight' && hasChildren) {
        const isExpanded = !collapsedKeys().includes(itemId as Id);
        
        if (!isExpanded) {
          // Expand if collapsed
          toggleExpand(itemId as Id);
          
          // Focus the current item after expanding
          focusSelectedItem();
        } else {
          // If already expanded, move to first child
          const childElements = getChildrenAttrs(graph, setGraph, vertex);
          
          if (childElements.length > 0) {
            onLayoutItemClick(
              layoutStoreVertex(),
              formStoreVertex(),
              childElements[0].id,
              graph,
              setGraph,
            );
            
            // Focus the first child
            focusSelectedItem();
          } else {
            // Make sure we maintain focus if something went wrong
            focusSelectedItem();
          }
        }
      } else {
        // Just ensure focus is maintained
        focusSelectedItem();
      }
    }
  };

  return (
    <As
      as="div"
      css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      `}
      tabIndex={0}
    >
      <As
        as="div"
        css={css`
          display: flex;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e5e5;
          gap: 8px;
          position: sticky;
          top: 0;
          background-color: white;
        `}
      >
              <As
          as="h3"
          css={css`
            color: rgb(17,24,39);
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          `}
        >
          <Icon icon="tabler:layout-2" />
          Layers
        </As>


          <IconButton
          onClick={toggleAllJsonEditors}
            css={[
              ICON_BUTTON_STYLES.baseCss,
              ICON_BUTTON_STYLES.defaultCss,
              ICON_BUTTON_STYLES.spacingCss,
              css`
              ${formStoreVertex()?.P.showAllJsonEditors ? "color: ${args.theme.var.color.primary};" : ""}
              background-color: transparent;
              border: none;
        `,]}
            icon="tabler:json" 
            size={18} 
          />

      </As>
      <As
        as="div"
        css={css`
          padding: 0;
          margin: 0;
          overflow-y: auto;
          flex: 1;
          scroll-behavior: smooth;
        `}
        onKeyDown={handleKeyDown}
        ref={setTreeRef}
      >
        <Show when={formStoreVertex()}>
          <For each={rootVertexes()}>
            {(vertex) => (
              <LayoutTreeItem
                collapsedKeys={collapsedKeys}
                metaVertex={vertex}
                toggleExpand={toggleExpand}
              />
            )}
          </For>
        </Show>
      </As>
    </As>
  );
}
