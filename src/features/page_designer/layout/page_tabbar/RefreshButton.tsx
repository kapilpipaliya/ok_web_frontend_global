import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonCss } from "~/pages/settings/constants";
import { onMount, onCleanup } from "solid-js";
import { tinykeys } from "tinykeys";

export function RefreshButton(props: { handleRefresh: () => void }) {
  // Register keyboard shortcuts on mount (window is only available client-side).
  // `$mod` resolves to Cmd on macOS and Ctrl elsewhere.
  onMount(() => {
    const refresh = (e: KeyboardEvent) => {
      e.preventDefault();
      props.handleRefresh();
    };

    const unsubscribe = tinykeys(
      window,
      {
        F5: refresh,
        "$mod+KeyU": refresh,
      },
      // Fire regardless of focused element (e.g. while typing in an input).
      { ignore: () => false },
    );

    onCleanup(unsubscribe);
  });

  return (
    <IconButton
      css={headerIconButtonCss}
      size={18}
      icon="ph:arrows-counter-clockwise"
      onClick={props.handleRefresh}
      title="Refresh Preview (F5 or Ctrl+U)"
      tooltipGroup="page-buttons"
    />
  );
}
