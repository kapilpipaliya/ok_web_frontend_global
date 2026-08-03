import { createAsync } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import {
  getMigrationRequestForAllShopsAction,
  saveMigrationRequestForAllShopsAction,
} from "~/server/shopMigrationRequestServer";

export function ShopMigrationRequestSettings() {
  const { showSuccessToast, showErrorToast } = useToast();
  const [refreshKey, setRefreshKey] = createSignal(0);
  const [saving, setSaving] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const migrationRequest = createAsync(
    async () => {
      refreshKey();
      setErrorMessage(null);
      const result = await getMigrationRequestForAllShopsAction();
      if (result.success) return result;
      if (result.error) setErrorMessage(result.error);
      return null;
    },
    { deferStream: true },
  );

  const handleSaveMigrationRequest = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const result = await saveMigrationRequestForAllShopsAction();
      if (result.success) {
        showSuccessToast(
          "Migration request for all shops saved. Shops will run migration on next load when their last migration is older than this time.",
        );
        setRefreshKey((prev) => prev + 1);
      } else {
        setErrorMessage(result.error ?? "Failed to save");
        showErrorToast(result.error ?? "Failed to save migration request");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
      showErrorToast(message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string | undefined) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <As
      as="div"
      css={`return \`._id {
  padding: 2rem;
}\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  background: var(--color-info-light-900, #e0f2fe);
  border: 1px solid var(--color-info-light-700, #0ea5e9);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}\`;`}
      >
        <As
          as="h3"
          css={"return `._id { margin: 0 0 0.5rem 0; font-size: 1rem; }`;"}
        >
          Shop migration request (all shops)
        </As>
        <As
          as="p"
          css={
            "return `._id { margin: 0; font-size: 0.875rem; opacity: 0.9; }`;"
          }
        >
          Set a global "migration request" time. Each Shopify shop runs
          migration only when this time is <strong>greater than</strong> that
          shop's last migration time. Use this after deploying schema changes so
          shops migrate on next load instead of on every load.
        </As>
      </As>

      <Show when={errorMessage()}>
        <As
          as="div"
          css={`return \`._id {
  background: var(--color-error-light-900, #fee2e2);
  border: 1px solid var(--color-error-light-700, #dc2626);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  color: var(--color-error-dark-700, #b91c1c);
}\`;`}
        >
          {errorMessage()}
        </As>
      </Show>

      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}\`;`}
      >
        <As as="span" css={"return `._id { font-weight: 500; }`;"}>
          Current migration request time:
        </As>
        <As as="span" css={"return `._id { font-family: monospace; }`;"}>
          {migrationRequest()?.migrationRequestAt
            ? formatDate(migrationRequest()?.migrationRequestAt)
            : "Not set"}
        </As>
      </As>

      <As
        as="button"
        css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  background: var(--color-primary, #2563eb);
  color: var(--color-primary-text, #fff);
  border: none;
  cursor: pointer;
}
._id:disabled { opacity: 0.6; cursor: not-allowed; }
._id:hover:not(:disabled) { filter: brightness(1.05); }
\`;`}
        onClick={handleSaveMigrationRequest}
        disabled={saving()}
      >
        {saving() ? "Saving…" : "Save migration request for all shops"}
      </As>
    </As>
  );
}
