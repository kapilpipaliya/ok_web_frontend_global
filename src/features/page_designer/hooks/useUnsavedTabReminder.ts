import { createSignal, onCleanup, onSettled } from "solid-js";

import type { UnsavedTabInfo } from "../utils/getUnsavedTabs";

const REMINDER_INTERVAL_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;

interface TabTracking {
  lastRemindedAt: number;
  unsavedSince: number;
}

interface UseUnsavedTabReminderOptions {
  getUnsavedTabs: () => UnsavedTabInfo[];
  isBlocked: () => boolean;
}

export function useUnsavedTabReminder(options: UseUnsavedTabReminderOptions) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [tabsToRemind, setTabsToRemind] = createSignal<UnsavedTabInfo[]>([]);
  const tabTracking = new Map<string, TabTracking>();

  const getTabsNeedingReminder = (): UnsavedTabInfo[] => {
    const unsavedTabs = options.getUnsavedTabs();
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

  const dismiss = () => {
    setIsOpen(false);
    setTabsToRemind([]);
  };

  const checkForReminder = () => {
    if (options.isBlocked() || isOpen()) {
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

  onSettled(() => {
    const intervalId = window.setInterval(checkForReminder, CHECK_INTERVAL_MS);
    onCleanup(() => {
      window.clearInterval(intervalId);
    });
  });

  return {
    dismiss,
    isOpen,
    tabsToRemind,
  };
}
