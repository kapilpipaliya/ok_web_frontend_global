import { createMemo, onSettled, Show, createSignal } from "solid-js";
import { IconButton } from "~/components/styled/IconButton";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { buildPageDesignerUrl } from "~/features/page_designer/utils/pageDesignerUrl";

export function PublicPageAdminFloatingButton(
  props: Readonly<{
    pageKey: () => string | undefined;
  }>,
) {
  const [graph] = useGraph();
  // Prevent SSR/CSR markup mismatches during hydration.
  // We only show the button after mount, so the initial hydrated output
  // matches the server output (button not rendered).
  const [isClientReady, setIsClientReady] = createSignal(false);
  onSettled(() => {
    setIsClientReady(true);
  });

  const adminEditUrl = createMemo(() => {
    const key = props.pageKey();
    if (!key) return undefined;

    return buildPageDesignerUrl("Page", [{ entity: "Page", key }]);
  });

  return (
    <Show when={isAdminRole(graph) && isClientReady() && adminEditUrl()}>
      <IconButton
        href={adminEditUrl()!}
        target="_blank"
        icon="ph:gear"
        size={22}
        title="Edit this page in admin"
        css={`return \`._id {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 9999;
  background-color: \${t.var.color.primary};
  color: \${t.var.color.primary_text};
  border: 1px solid \${t.var.color.border};
  border-radius: 9999px;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  text-decoration: none;

  &:hover:not(:disabled) {
    background-color: \${t.var.color.primary_dark_100};
  }
}\`;`}
      />
    </Show>
  );
}
