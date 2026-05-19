import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";
import {
  createEffect,
  createSignal,
  onCleanup,
  Show,
  type JSX,
} from "solid-js";
import { Portal } from "solid-js/web";
import { As } from "~/components/As";
import type { SchemaJobStatusRow } from "~/server/schema/schemaOperationsManagement";

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

export interface SchemaJobOutputPopoverProps {
  row: () => SchemaJobStatusRow | undefined;
  children: JSX.Element;
}

export function SchemaJobOutputPopover(props: SchemaJobOutputPopoverProps) {
  const [open, setOpen] = createSignal(false);
  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [coords, setCoords] = createSignal({ x: 0, y: 0 });

  const outputText = () => formatJobOutput(props.row());
  const canShow = () => hasJobOutput(props.row());

  const updatePosition = async () => {
    const refEl = reference();
    const floatEl = floating();
    if (!refEl || !floatEl) {
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
    if (!open() || !reference() || !floating()) {
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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
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
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    onCleanup(() => {
      document.removeEventListener("keydown", onKeyDown);
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

  return (
    <>
      <span
        ref={setReference}
        style={{
          display: "inline-block",
          cursor: canShow() ? "pointer" : "default",
        }}
        onMouseEnter={openPopover}
        onMouseLeave={scheduleClose}
        onClick={(e) => {
          e.stopPropagation();
          if (!canShow()) {
            return;
          }
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!canShow()) {
              return;
            }
            setOpen((v) => !v);
          }
        }}
        role={canShow() ? "button" : undefined}
        tabIndex={canShow() ? 0 : undefined}
        aria-expanded={canShow() ? open() : undefined}
      >
        {props.children}
      </span>

      <Show when={open() && canShow()}>
        <Portal>
          <As
            as="div"
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
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
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
  color: \${args.theme.var.color.muted};
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
  color: \${args.theme.var.color.muted};
  padding: 0.125rem 0.25rem;
}\`;`}
                aria-label="Close"
              >
                ×
              </As>
            </As>
            <As
              as="pre"
              css={`return \`._id {
  margin: 0;
  font-size: 0.7rem;
  line-height: 1.4;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-word;
  color: \${args.theme.var.color.text};
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
