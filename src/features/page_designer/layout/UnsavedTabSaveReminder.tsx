import { useNavigate } from "@solidjs/router";
import { createSignal, For, onCleanup, onMount } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { saveAndCaptureForm } from "~/features/page_designer/utils/saveAndCapture";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../context/LayoutContext";
import {
  getUnsavedTabs,
  type UnsavedTabInfo,
} from "../utils/getUnsavedTabs";

const REMINDER_INTERVAL_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;

interface TabTracking {
  lastRemindedAt: number;
  unsavedSince: number;
}

export function UnsavedTabSaveReminder() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();

  const [isOpen, setIsOpen] = createSignal(false);
  const [tabsToRemind, setTabsToRemind] = createSignal<UnsavedTabInfo[]>([]);
  const [isSaving, setIsSaving] = createSignal(false);

  const tabTracking = new Map<string, TabTracking>();

  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const getTabsNeedingReminder = (): UnsavedTabInfo[] => {
    const unsavedTabs = getUnsavedTabs(graph, layoutStore());
    const unsavedFormIds = new Set(unsavedTabs.map((tab) => tab.formId));
    const now = Date.now();

    for (const formId of tabTracking.keys()) {
      if (!unsavedFormIds.has(formId)) {
        tabTracking.delete(formId);
      }
    }

    const tabsNeedingReminder: UnsavedTabInfo[] = [];

    for (const tab of unsavedTabs) {
      let tracking = tabTracking.get(tab.formId);
      if (!tracking) {
        tracking = { unsavedSince: now, lastRemindedAt: 0 };
        tabTracking.set(tab.formId, tracking);
      }

      const timeSinceUnsaved = now - tracking.unsavedSince;
      const timeSinceLastReminder = tracking.lastRemindedAt
        ? now - tracking.lastRemindedAt
        : Number.POSITIVE_INFINITY;

      if (
        timeSinceUnsaved >= REMINDER_INTERVAL_MS &&
        timeSinceLastReminder >= REMINDER_INTERVAL_MS
      ) {
        tabsNeedingReminder.push(tab);
      }
    }

    return tabsNeedingReminder;
  };

  const markTabsReminded = (tabs: UnsavedTabInfo[]) => {
    const now = Date.now();
    for (const tab of tabs) {
      const tracking = tabTracking.get(tab.formId);
      if (tracking) {
        tracking.lastRemindedAt = now;
      }
    }
  };

  const checkForReminder = () => {
    if (isOpen() || isSaving()) {
      return;
    }

    const tabsNeedingReminder = getTabsNeedingReminder();
    if (tabsNeedingReminder.length === 0) {
      return;
    }

    markTabsReminded(tabsNeedingReminder);
    setTabsToRemind(tabsNeedingReminder);
    setIsOpen(true);
  };

  onMount(() => {
    const intervalId = window.setInterval(checkForReminder, CHECK_INTERVAL_MS);
    onCleanup(() => {
      window.clearInterval(intervalId);
    });
  });

  const handleDismiss = () => {
    setIsOpen(false);
    setTabsToRemind([]);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const openedFormIds = layoutStore().openedFormIds.slice().reverse();

      for (const openedFormId of openedFormIds) {
        const formId = graph.vertexes[openedFormId]?.P?.formId;
        if (!formId) {
          continue;
        }

        const formStoreVertex = graph.vertexes[formId] as
          | Vertex<FormStoreObject>
          | undefined;
        const txnId = formStoreVertex?.P?.txnId;
        if (!txnId || isDisabledTxn(txnId, graph)) {
          continue;
        }

        const isMainForm = layoutStore().mainFormId === formId;
        await saveAndCaptureForm(
          () => graph.vertexes[formId] as Vertex<FormStoreObject>,
          graph,
          setGraph,
          showErrorToast,
          showLoadingToast,
          showWarningToast,
          navigate,
          isMainForm,
        );
      }

      if (getUnsavedTabs(graph, layoutStore()).length === 0) {
        handleDismiss();
      }
    } finally {
      setIsSaving(false);
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
              onClick={handleDismiss}
              type="button"
            >
              Remind Me Later
            </As>
          </As>
        )}
        open={isOpen}
        setOpen={(open) => {
          if (!open) {
            handleDismiss();
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
