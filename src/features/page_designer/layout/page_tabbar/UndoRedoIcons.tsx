import { For, onCleanup, onMount, createMemo } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { useGraph } from "~/lib/graph/GraphContext";
import { redo, redoAllowed } from "~/lib/graph/transaction/history/redo";
import { undo, undoAllowed } from "~/lib/graph/transaction/history/undo";
import { headerIconButtonCss } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function UndoRedoIcons(props: { formStoreId: string }) {
  const [graph, setGraph] = useGraph();

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;

  // Get transaction details
  const txnId = () => formStoreVertex()?.P.txnId;
  const txnVertex = () => txnId() ? graph.vertexes[`txn${txnId()}`] : undefined;
  const txnStatus = () => txnVertex()?.P?.status;
  
  // Create transaction state info for tooltips
  const transactionInfo = createMemo(() => {
    if (!txnVertex()) return { undoSteps: 0, redoSteps: 0, statusText: "" };
    
    const txn = txnVertex()?.P;
    if (!txn) return { undoSteps: 0, redoSteps: 0, statusText: "" };
    
    const totalSteps = txn.steps.length;
    const activeIndex = txn.activeUndoIndex;
    
    // Calculate how many steps can be undone and redone
    const undoSteps = activeIndex + 1;
    const redoSteps = totalSteps - activeIndex - 1;
    
    // Status text for tooltip
    let statusText = "";
    if (txn.status === 'modified') statusText = "Unsaved changes";
    else if (txn.status === 'reverted') statusText = "Reverted changes";
    else if (txn.status === 'error') statusText = "Error state";
    else if (txn.status === 'committed') statusText = "All changes saved";
    
    return {
      undoSteps,
      redoSteps,
      statusText
    };
  });
  
  // Enhanced with visual indicators for transaction status
  const icons = [
    {
      disabled: () => !undoAllowed(formStoreVertex()?.P.txnId, graph),
      icon: "ph:arrow-counter-clockwise",
      onClick: () => undo(formStoreVertex()?.P.txnId, graph, setGraph),
      getTooltip: () => {
        const info = transactionInfo();
        const undoTooltip = `Undo (Ctrl+Z)`;
        
        if (info.undoSteps > 0) {
          return `${undoTooltip} - ${info.undoSteps} ${info.undoSteps === 1 ? 'step' : 'steps'} available`;
        }
        
        return undoTooltip;
      },
      getCss: () => {
        // When there are uncommitted or reverted changes, highlight undo button
        const status = txnStatus();
        if (status === 'modified' || status === 'reverted') {
          return [headerIconButtonCss, css`
            color: \${args.theme.var.color.blue_600};
            &:hover:not(:disabled) {
              color: \${args.theme.var.color.blue_500};
            }
          `];
        }
        return headerIconButtonCss;
      }
    },
    {
      disabled: () => !redoAllowed(formStoreVertex()?.P.txnId, graph),
      icon: "ph:arrow-clockwise",
      onClick: () => redo(formStoreVertex()?.P.txnId, graph, setGraph),
      getTooltip: () => {
        const info = transactionInfo();
        const redoTooltip = `Redo (Ctrl+Y)`;
        
        if (info.redoSteps > 0) {
          return `${redoTooltip} - ${info.redoSteps} ${info.redoSteps === 1 ? 'step' : 'steps'} available`;
        }
        
        return redoTooltip;
      },
      getCss: () => {
        // Check if there are steps that can be redone
        const isRedoAvailable = redoAllowed(formStoreVertex()?.P.txnId, graph);
        if (isRedoAvailable) {
          return [headerIconButtonCss, css`
            color: \${args.theme.var.color.blue_600};
            &:hover:not(:disabled) {
              color: \${args.theme.var.color.blue_500};
            }
          `];
        }
        return headerIconButtonCss;
      }
    },
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    const formTxnId = formStoreVertex()?.P.txnId;
    if (!formTxnId) return;
    
    // Undo - Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (undoAllowed(formTxnId, graph)) {
        undo(formTxnId, graph, setGraph);
      }
    }
    
    // Redo - Ctrl+Y or Ctrl+Shift+Z
    if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      if (redoAllowed(formTxnId, graph)) {
        redo(formTxnId, graph, setGraph);
      }
    }
  };

  // Register and clean up event listeners
  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  // Status indicator component
  const StatusIndicator = () => {
    const info = transactionInfo();
    if (!info.statusText) return null;
    
    return (
      <div 
        style={{
          "font-size": "11px",
          "margin-left": "5px",
          "color": getStatusColor(),
          "white-space": "nowrap",
        }}
      >
        {info.statusText}
      </div>
    );
  };
  
  // Get color for status text
  const getStatusColor = () => {
    const status = txnStatus();
    switch (status) {
      case 'modified': return '${args.theme.var.color.orange_600}';
      case 'reverted': return '${args.theme.var.color.blue_600}';
      case 'committed': return '${args.theme.var.color.green_600}';
      case 'error': return '${args.theme.var.color.red_600}';
      default: return '${args.theme.var.color.gray_600}';
    }
  };

  return (
    <As
      as="div"
      css={css`
        margin-left: 2px;
        display: flex;
        align-items: center;
        gap: 2px;
        position: relative;
      `}
    >
      <For each={icons}>
        {(item) => (
          <IconButton
            css={item.getCss()}
            disabled={item.disabled()}
            icon={item.icon}
            onClick={item.onClick}
            size={18}
            title={item.getTooltip()}
            tooltipGroup="page-buttons"
          />
        )}
      </For>
      {/* <StatusIndicator /> */}
    </As>
  );
}
