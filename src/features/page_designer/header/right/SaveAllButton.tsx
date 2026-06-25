import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonCss } from "~/pages/settings/constants";

import { useSaveAllOpenTabs } from "../../hooks/useSaveAllOpenTabs";

export function SaveAllButton() {
  const { hasUnsavedTabs, isSaving, saveAll } = useSaveAllOpenTabs();

  const isDisabled = () => isSaving() || !hasUnsavedTabs();

  return (
    <IconButton
      css={
        isSaving()
          ? [
              headerIconButtonCss,
              `return \`._id {
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }\`;`,
            ]
          : headerIconButtonCss
      }
      disabled={isDisabled()}
      icon={isSaving() ? "ph:spinner" : "ic:baseline-save-all"}
      onClick={isDisabled() ? undefined : saveAll}
      size={22}
      title={isSaving() ? "Saving..." : "Save All"}
      tooltipGroup="right-buttons"
    />
  );
}
