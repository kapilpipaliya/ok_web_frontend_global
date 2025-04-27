import { css } from "~/lib/styles";
import type { GraphInterface } from "~/lib/graph/GraphContext";
import type { Id, Vertex } from "~/lib/graph/graph";
import type { SetStoreFunction } from "solid-js/store";
import { openInNewInternalTab } from "../pages/functions/openInNewInternalTab";

// Common styles for items in the designer
export const baseItemStyle = css`
  align-items: center;
  border-radius: 0.2rem;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 5px 0px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 35px;
  margin: 5px;
  padding: 10px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  position: relative;
`;

export const hoverItemStyle = css`
  background-color: #F2EDED;
  box-shadow: 1px 1px 1px;
  cursor: move;
`;

// Common icons and button styles
export const buttonStyle = css`
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

// Helper for preview behavior
export function setupPreview(
  props: () => {
    previewPageId: Id | null, 
    setPreviewPageId: (id: Id | null) => void,
    itemId: Id
  },
  callbacks: {
    setHoverPageId: (id: Id | null) => void,
    setIsHovered?: (isHovered: boolean) => void,
  },
  delay = 500
): {
  handleMouseEnter: () => void, 
  handleMouseLeave: (event: MouseEvent, floatingElement?: Node | null, previewRef?: HTMLElement | null) => void,
  previewTimer: NodeJS.Timeout | null
} {
  let previewTimer: NodeJS.Timeout | null = null;

  const handleMouseEnter = () => {
    const { previewPageId, setPreviewPageId, itemId } = props();
    
    if (previewPageId !== itemId) {
      setPreviewPageId(null);
    }
    
    callbacks.setHoverPageId(itemId);
    if (callbacks.setIsHovered) {
      callbacks.setIsHovered(true);
    }
    
    previewTimer = setTimeout(() => {
      const { setPreviewPageId, itemId } = props();
      setPreviewPageId(itemId);
    }, delay);
  };

  const handleMouseLeave = (event: MouseEvent, floatingElement?: Node | null, previewRef?: HTMLElement | null) => {
    if (previewTimer) {
      clearTimeout(previewTimer);
    }
    
    callbacks.setHoverPageId(null);
    if (callbacks.setIsHovered) {
      callbacks.setIsHovered(false);
    }
    
    const relatedTarget = event.relatedTarget as Node;
    if (
      (floatingElement && floatingElement.contains(relatedTarget)) ||
      (previewRef && previewRef.contains(relatedTarget))
    ) {
      // Mouse is over floating element or preview, don't close
      return;
    }
    
    const { setPreviewPageId } = props();
    setPreviewPageId(null);
  };

  return {
    handleMouseEnter,
    handleMouseLeave,
    previewTimer
  };
}

// Common function to open in new tab
export function createOpenInNewTab(
  layoutStoreId: Id,
  vertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>
) {
  return () => openInNewInternalTab(layoutStoreId, vertex, graph, setGraph);
} 