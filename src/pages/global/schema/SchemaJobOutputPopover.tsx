import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";
import { createEffect, createSignal, For, onCleanup, Show, type JSX } from "solid-js";
import { Portal } from "@solidjs/web";
import { tinykeys } from "tinykeys";
import { As } from "~/components/As";
import type { SchemaJobStatusRow } from "~/server/schema/schemaOperationsManagement";

export type SchemaJobOutputTab = {
  label: string;
  row: SchemaJobStatusRow;
};

function formatJobOutput(row: SchemaJobStatusRow | undefined): string | null {
  if (!row) {
    return null;
  }
  if (row.status === "success") {
    if (row.result != null) {
      try {
        return JSON.stringify(row.result, null, 2);
      } catch {
        return String(row.result);
      }
    }
    return "Job completed (no result payload).";
  }
  if (row.status === "failed" || row.status === "enqueue_failed") {
    const parts: string[] = [];
    if (row.error) {
      parts.push(row.error);
    }
    if (row.result != null) {
      try {
        parts.push(JSON.stringify(row.result, null, 2));
      } catch {
        parts.push(String(row.result));
      }
    }
    return parts.length > 0 ? parts.join("\n\n") : null;
  }
  return null;
}

export function hasJobOutput(row: SchemaJobStatusRow | undefined): boolean {
  return formatJobOutput(row) != null;
}

export function hasAnyJobOutput(tabs: SchemaJobOutputTab[]): boolean {
  return tabs.some((t) => hasJobOutput(t.row));
}

export interface SchemaJobOutputPopoverProps {
  tabs: () => SchemaJobOutputTab[];
  children: JSX.Element;
}

export function SchemaJobOutputPopover(props: SchemaJobOutputPopoverProps) {
  const [open, setOpen] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal(0);
  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [coords, setCoords] = createSignal({ x: 0, y: 0 });

  const visibleTabs = () => props.tabs().filter((t) => hasJobOutput(t.row));

  const canShow = () => visibleTabs().length > 0;

  const outputText = () => {
    const tabs = visibleTabs();
    const idx = activeTab();
    const row = tabs[idx]?.row ?? tabs[0]?.row;
    return formatJobOutput(row);
  };

  createEffect(() => {
    const tabs = visibleTabs();
    if (activeTab() >= tabs.length) {
      setActiveTab(0);
    }
  });

  const updatePosition = async () => {
    const refEl = reference();
    const floatEl = floating();
    if (!(refEl && floatEl)) {
      return;
    }
    const { x, y } = await computePosition(refEl, floatEl, {
      placement: "bottom-start",
      strategy: "fixed",
      middleware: [offset(8), flip(), shift({ padding: 12 })],
    });
    setCoords({ x, y });
  };

  createEffect(() => {
    if (!(open() && reference() && floating())) {
      return;
    }
    void updatePosition();
    const refEl = reference()!;
    const floatEl = floating()!;
    const cleanup = autoUpdate(refEl, floatEl, () => {
      void updatePosition();
    });
    onCleanup(cleanup);
  });

  createEffect(() => {
    if (!open()) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        target &&
        !reference()?.contains(target) &&
        !floating()?.contains(target)
      ) {
        setOpen(false);
      }
    };
    // Close on Escape, even while focus is inside the popover.
    const unsubscribeKeys = tinykeys(
      window,
      { Escape: () => setOpen(false) },
      { ignore: () => false },
    );
    document.addEventListener("pointerdown", onPointerDown, true);
    onCleanup(() => {
      unsubscribeKeys();
      document.removeEventListener("pointerdown", onPointerDown, true);
    });
  });

  let leaveTimer: ReturnType<typeof setTimeout> | undefined;

  const clearLeaveTimer = () => {
    if (leaveTimer !== undefined) {
      clearTimeout(leaveTimer);
      leaveTimer = undefined;
    }
  };

  const scheduleClose = () => {
    clearLeaveTimer();
    leaveTimer = setTimeout(() => setOpen(false), 150);
  };

  const openPopover = () => {
    if (!canShow()) {
      return;
    }
    clearLeaveTimer();
    setOpen(true);
  };

  onCleanup(() => {
    clearLeaveTimer();
  });

  if (!canShow()) {
    return <>{props.children}</>;
  }

  return (
    <>
      <span
        ref={setReference}
        style={{ display: "inline-block", cursor: "pointer" }}
        onMouseEnter={openPopover}
        onMouseLeave={scheduleClose}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={open()}
      >
        {props.children}
      </span>

      <Show when={open()}>
        <Portal>
          <As
            as="motionFragment"
            ref={setFloating}
            role="dialog"
            aria-label="Job output"
            onMouseEnter={clearLeaveTimer}
            onMouseLeave={scheduleClose}
            style={{
              position: "fixed",
              left: `${coords().x}px`,
              top: `${coords().y}px`,
              "z-index": "10000",
              "max-width": "min(32rem, calc(100vw - 1.5rem))",
              "max-height": "min(24rem, calc(100vh - 1.5rem))",
              overflow: "auto",
            }}
            css={`return \`._id {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid \${t.var.color.border};
  background: \${t.var.color.background};
  color: \${t.var.color.text};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}\`;`}
          >
            <As
              as="motionFragment"
              css={`return \`._id {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}\`;`}
            >
              <As
                as="span"
                css={`return \`._id {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: \${t.var.color.text_light_500};
}\`;`}
              >
                Job output
              </As>
              <As
                as="button"
                type="button"
                onClick={() => setOpen(false)}
                css={`return \`._id {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  color: \${t.var.color.text_light_500};
  padding: 0.125rem 0.25rem;
}\`;`}
                aria-label="Close"
              >
                ×
              </As>
            </As>

            <Show when={visibleTabs().length > 1}>
              <As
                as="motionFragment"
                role="tablist"
                css={`return \`._id {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid \${t.var.color.border};
  padding-bottom: 0.25rem;
}\`;`}
              >
                <For each={visibleTabs()}>
                  {(tab, index) => (
                    <As
                      as="button"
                      type="button"
                      role="tab"
                      aria-selected={activeTab() === index()}
                      onClick={() => setActiveTab(index())}
                      css={(_) => {
                        const selected = activeTab() === index();
                        return `return \`._id {
  border: none;
  border-radius: 0.25rem 0.25rem 0 0;
  padding: 0.25rem 0.625rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  background: ${selected ? _.theme.var.color.background_light_200 : "transparent"};
  color: ${selected ? _.theme.var.color.text : _.theme.var.color.text_light_500};
  border-bottom: 2px solid ${selected ? _.theme.var.color.primary : "transparent"};
  margin-bottom: -1px;
}\`;`;
                      }}
                    >
                      {tab.label}
                    </As>
                  )}
                </For>
              </As>
            </Show>

            <As
              as="pre"
              role="tabpanel"
              css={`return \`._id {
  margin: 0;
  font-size: 0.7rem;
  line-height: 1.4;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-word;
  color: \${t.var.color.text};
}\`;`}
            >
              {outputText()}
            </As>
          </As>
        </Portal>
      </Show>
    </>
  );
}
