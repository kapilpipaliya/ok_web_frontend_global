import {
  createEffect,
  createSignal,
  onCleanup,
  Show,
  type JSX,
} from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

export interface SchemaJobRunnerProps {
  title: string;
  /** e.g. /api/schema/export */
  apiPath: string;
}

function jobIdFromSearch(search: string): string | null {
  return new URLSearchParams(search).get("jobId");
}

export default function SchemaJobRunner(
  props: Readonly<SchemaJobRunnerProps>,
): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const [jobId, setJobId] = createSignal<string | null>(null);
  const [status, setStatus] = createSignal<string | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [result, setResult] = createSignal<unknown>(null);
  const [busy, setBusy] = createSignal(false);

  let pollTimer: ReturnType<typeof setInterval> | undefined;
  /** Last `jobId` from the URL we started polling for (avoids resetting the interval when search is unchanged). */
  let syncedJobIdFromUrl: string | null | undefined;

  const stopPolling = () => {
    if (pollTimer !== undefined) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
  };

  const pollOnce = async (id: string) => {
    const res = await fetch(`/api/schema/jobs/${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    const body = (await res.json()) as {
      status?: string;
      error?: string;
      result?: unknown;
      message?: string;
    };

    if (res.status === 404) {
      setStatus("complete");
      setError(
        body.message ?? "Job not found (may have completed and been removed).",
      );
      stopPolling();
      setBusy(false);
      return;
    }

    if (!res.ok) {
      setError(body.message ?? `HTTP ${res.status}`);
      stopPolling();
      setBusy(false);
      return;
    }

    setStatus(body.status ?? null);
    setError(body.error ?? null);
    if (body.result !== undefined && body.result !== null) {
      setResult(body.result);
    }

    if (body.status === "success" || body.status === "failed") {
      stopPolling();
      setBusy(false);
    }
  };

  const navigateToJobId = (id: string) => {
    const path = location.pathname;
    const url = new URL(
      typeof window === "undefined" ? "http://local" : window.location.href,
    );
    url.searchParams.set("jobId", id);
    navigate(`${path}${url.search}`, { scroll: false, replace: false });
  };

  /** When `location.search` changes (including `jobId` added, changed, or removed), align state and polling. */
  createEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const id = jobIdFromSearch(location.search);
    setJobId(id);

    if (syncedJobIdFromUrl === id) {
      return;
    }
    syncedJobIdFromUrl = id;

    stopPolling();

    if (id) {
      setBusy(true);
      void pollOnce(id);
      pollTimer = setInterval(() => {
        void pollOnce(id);
      }, 1200);
    } else {
      setBusy(false);
      setStatus(null);
      setError(null);
      setResult(null);
    }
  });

  onCleanup(() => {
    stopPolling();
  });

  const startJob = async () => {
    setError(null);
    setResult(null);
    setStatus(null);
    setBusy(true);
    try {
      const u =
        typeof window === "undefined"
          ? new URL("http://local")
          : new URL(window.location.href);
      u.searchParams.delete("jobId");
      const suffix = u.search;

      const res = await fetch(`${props.apiPath}${suffix}`, {
        credentials: "include",
      });
      const body = (await res.json()) as { jobId?: string; message?: string };
      if (!(res.ok && body.jobId)) {
        setError(body.message ?? `Failed to queue job (${res.status})`);
        setBusy(false);
        return;
      }
      navigateToJobId(body.jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem", "max-width": "960px", margin: "0 auto" }}>
      <h1 style={{ "margin-bottom": "0.75rem" }}>{props.title}</h1>
      <p style={{ "margin-bottom": "1rem", color: "#555" }}>
        Jobs run in the background. Refreshing keeps <code>jobId</code> in the
        URL so polling continues.
      </p>

      <Show when={!jobId()}>
        <button
          type="button"
          disabled={busy()}
          onClick={() => void startJob()}
          style={{
            padding: "0.5rem 1rem",
            cursor: busy() ? "wait" : "pointer",
            "margin-bottom": "1rem",
          }}
        >
          {busy() ? "Starting…" : "Start job"}
        </button>
      </Show>

      <Show when={jobId()}>
        <div style={{ "margin-bottom": "0.75rem" }}>
          <strong>Job id:</strong> <code>{jobId()}</code>
        </div>
      </Show>

      <Show when={status()}>
        <div style={{ "margin-bottom": "0.75rem" }}>
          <strong>Status:</strong> {status()}
        </div>
      </Show>

      <Show when={error()}>
        <div
          style={{
            "margin-bottom": "1rem",
            color: "#b00020",
            "white-space": "pre-wrap",
          }}
        >
          {error()}
        </div>
      </Show>

      <Show when={result() !== null && result() !== undefined}>
        <details open>
          <summary style={{ cursor: "pointer", "margin-bottom": "0.5rem" }}>
            Result (JSON)
          </summary>
          <pre
            style={{
              background: "#f6f8fa",
              padding: "1rem",
              overflow: "auto",
              "max-height": "480px",
              "font-size": "12px",
            }}
          >
            {JSON.stringify(result(), null, 2)}
          </pre>
        </details>
      </Show>
    </div>
  );
}
