import { For } from "solid-js";

import { CustomModal } from "~/components/styled/modal/CustomModal";
import { As } from "~/components/As";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { useSaveAllOpenTabs } from "../hooks/useSaveAllOpenTabs";
import { useUnsavedTabReminder } from "../hooks/useUnsavedTabReminder";

export function UnsavedTabSaveReminder() {
  const { hasUnsavedTabs, isSaving, saveAll, unsavedTabs } =
    useSaveAllOpenTabs();

  const { dismiss, isOpen, tabsToRemind } = useUnsavedTabReminder({
    getUnsavedTabs: unsavedTabs,
    isBlocked: () => isSaving(),
  });

  const handleSaveAll = async () => {
    const allSaved = await saveAll();
    if (allSaved || !hasUnsavedTabs()) {
      dismiss();
    }
  };

  return (
    <CustomModal
      containerCss={"return `._id {z-index: 3;}`;"}
      customTitle={<span>Save your work</span>}
      dialogCss={
        "return `._id {min-width: 24rem; max-width: 32rem; border-radius: 10px; padding: 0;}`;"
      }
      footer={() => (
        <As as="div" css={[SETTINGS_CONSTANTS.MODAL.FOOTER.CSS]}>
          <As
            as="button"
            css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS]}
            disabled={isSaving()}
            onClick={handleSaveAll}
            type="button"
          >
            {isSaving() ? "Saving..." : "Save All"}
          </As>
          <As
            as="button"
            css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS]}
            disabled={isSaving()}
            onClick={dismiss}
            type="button"
          >
            Remind Me Later
          </As>
        </As>
      )}
      open={isOpen}
      setOpen={(open) => {
        if (!open) {
          dismiss();
        }
      }}
    >
      <As as="div" css={[SETTINGS_CONSTANTS.MODAL.BODY.CSS]}>
        <As as="p" css={[SETTINGS_CONSTANTS.MODAL.BODY.TEXT_CSS]}>
          You have unsaved changes for more than 5 minutes. Please save your
          Page, Component, Function, or EmailTemplate regularly.
        </As>
        <As
          as="ul"
          css={`return \`._id {
              margin: 12px 0 0;
              padding-left: 20px;
              color: \${args.theme.var.color.text};
            }\`;`}
        >
          <For each={tabsToRemind()}>
            {(tab) => (
              <As as="li" css={"return `._id { margin-bottom: 4px; }`;"}>
                {tab.label} - {tab.key}
              </As>
            )}
          </For>
        </As>
      </As>
    </CustomModal>
  );
}
