import { createStore, produce as p } from 'solid-js/store';

import type { Action, State, Toast, ToastOptions } from '../types';

const [initOptions, setInitOptions] = createStore<{
  options: ToastOptions[];
}>({
  options: [],
});

const [store, setStore] = createStore<State>({
  pausedAt: undefined,
  toasts: [],
});

export const createTimers = () => {
  const { pausedAt, toasts } = store;
  if (pausedAt) return;
  const now = Date.now();
  const timers = toasts.map((toast) => {
    if (toast.duration === Number.POSITIVE_INFINITY) return;

    const durationLeft = (toast.duration || 0) + toast.pauseDuration - (now - toast.createdAt);

    if (durationLeft <= 0) {
      if (toast.visible) {
        dispatch({
          toastId: toast.id,
          type: 'dismiss',
        });
      }
      return;
    }

    return setTimeout(() => {
      dispatch({
        toastId: toast.id,
        type: 'dismiss',
      });
    }, durationLeft);
  });

  return timers;
};

const removalQueue = new Map<Toast['id'], ReturnType<typeof setTimeout>>();

const scheduleRemoval = (toastId: string, unmountDelay: number) => {
  if (removalQueue.has(toastId)) return;

  const timeout = setTimeout(() => {
    removalQueue.delete(toastId);
    dispatch({
      toastId,
      type: 'remove',
    });
  }, unmountDelay);

  removalQueue.set(toastId, timeout);
};

const unscheduleRemoval = (toastId: string) => {
  const timeout = removalQueue.get(toastId);
  removalQueue.delete(toastId);
  if (timeout) clearTimeout(timeout);
};

export const dispatch = (action: Action) => {
  switch (action.type) {
    case 'add':
      setStore('toasts', (t) => {
        const toasts = t as Toast[];
        return [action.toast, ...toasts];
      });
      break;
    case 'dismiss':
      const { toastId } = action;
      const toasts = store.toasts;

      if (toastId) {
        const toastToRemove = toasts.find((t) => t.id === toastId);
        if (toastToRemove) scheduleRemoval(toastId, toastToRemove.unmountDelay);
        setStore(
          'toasts',
          (t) => t.id === toastId,
          p((t) => (t.visible = false))
        );
      } else {
        toasts.forEach((t) => {
          scheduleRemoval(t.id, t.unmountDelay);
        });
        setStore(
          'toasts',
          (t) => t.id !== undefined,
          p((t) => (t.visible = false))
        );
      }

      break;
    case 'remove':
      if (!action.toastId) {
        setStore('toasts', []);
        break;
      }
      setStore('toasts', (t) => {
        const toasts = t as Toast[];
        return toasts.filter((t) => t.id !== action.toastId);
      });
      break;
    case 'update':
      if (action.toast.id) {
        unscheduleRemoval(action.toast.id);
      }

      setStore(
        'toasts',
        (t) => t.id === action.toast.id,
        (t) => {
          const toast = t as Toast;
          return {
            ...toast,
            ...action.toast,
          };
        }
      );
      break;
    case 'upsert':
      store.toasts.find((t) => t.id === action.toast.id)
        ? dispatch({ toast: action.toast, type: 'update' })
        : dispatch({ toast: action.toast, type: 'add' });
      break;
    case 'start_pause':
      setStore(
        p((s) => {
          s.pausedAt = Date.now();
          s.toasts.forEach((t) => {
            t.paused = true;
          });
        })
      );
      break;
    case 'end_pause':
      const pauseInterval = action.time - (store.pausedAt || 0);
      setStore(
        p((s) => {
          s.pausedAt = undefined;
          s.toasts.forEach((t) => {
            t.pauseDuration += pauseInterval;
            t.paused = false;
          });
        })
      );
      break;
  }
};

export const initOptionsDispatch = (action: Action) => {};
export { initOptions, store };
