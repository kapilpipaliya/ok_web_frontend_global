/**
 * In-process Playwright browser slots for AskZoom workers.
 * Keyed by subdomain + userId (no global "active" slot).
 */

export type AskzoomPlaywrightSlot = {
  browser: any;
  context: any;
  page: any;
  manageTimer: ReturnType<typeof setInterval> | null;
  screenshotTimer: ReturnType<typeof setInterval> | null;
  managing: boolean;
  admittedCount: number;
  jobAction: string;
  leaving: boolean;
  ownerUserId: string;
  cancelRequested: boolean;
  recordVideo: boolean;
  /** Per-launch live recording directory (isolated under user live/). */
  liveDir: string;
  recordingJobId: string;
};

type Realm = {
  slots: Map<string, AskzoomPlaywrightSlot>;
};

const realms = new Map<string, Realm>();

const realmKey = (subDomain?: string | null) =>
  String(subDomain || "default").trim() || "default";

const getRealm = (subDomain?: string | null): Realm => {
  const key = realmKey(subDomain);
  let realm = realms.get(key);
  if (!realm) {
    realm = { slots: new Map() };
    realms.set(key, realm);
  }
  return realm;
};

export const createEmptySlot = (userId: string): AskzoomPlaywrightSlot => ({
  browser: null,
  context: null,
  page: null,
  manageTimer: null,
  screenshotTimer: null,
  managing: false,
  admittedCount: 0,
  jobAction: "",
  leaving: false,
  ownerUserId: userId,
  cancelRequested: false,
  recordVideo: true,
  liveDir: "",
  recordingJobId: "",
});

export const countBusySlots = (subDomain?: string | null): number => {
  const { slots } = getRealm(subDomain);
  let n = 0;
  for (const slot of slots.values()) {
    if (slot.browser || slot.managing) n += 1;
  }
  return n;
};

export const getSlot = (
  subDomain: string | null | undefined,
  userId: string,
  { create = true } = {},
): AskzoomPlaywrightSlot | null => {
  const id = String(userId || "").trim();
  if (!id) {
    throw new Error("userId is required for Playwright runtime slot");
  }
  const realm = getRealm(subDomain);
  let slot = realm.slots.get(id) || null;
  if (!slot) {
    if (!create) return null;
    slot = createEmptySlot(id);
    realm.slots.set(id, slot);
  }
  return slot;
};

export const deleteSlot = (
  subDomain: string | null | undefined,
  userId: string,
): boolean => {
  const id = String(userId || "").trim();
  if (!id) return false;
  return getRealm(subDomain).slots.delete(id);
};

/** Remove slot if it has no browser and is not managing. */
export const deleteSlotIfIdle = (
  subDomain: string | null | undefined,
  userId: string,
): boolean => {
  const id = String(userId || "").trim();
  if (!id) return false;
  const realm = getRealm(subDomain);
  const slot = realm.slots.get(id);
  if (!slot) return false;
  if (slot.browser || slot.managing) return false;
  return realm.slots.delete(id);
};

export const listSlots = (subDomain?: string | null) => {
  const { slots } = getRealm(subDomain);
  return [...slots.entries()].map(([userId, slot]) => ({
    userId,
    busy: !!(slot.browser || slot.managing),
    managing: !!slot.managing,
    jobAction: slot.jobAction || "",
    hasBrowser: !!slot.browser,
  }));
};

export const clearAllSlots = (subDomain?: string | null): void => {
  getRealm(subDomain).slots.clear();
};

export const forEachSlot = (
  subDomain: string | null | undefined,
  fn: (slot: AskzoomPlaywrightSlot) => void | Promise<void>,
): Promise<void> => {
  const { slots } = getRealm(subDomain);
  return Promise.all([...slots.values()].map((slot) => fn(slot))).then(
    () => undefined,
  );
};
