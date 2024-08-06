import { createRoot, createSignal, untrack } from 'solid-js';

import { ActionType, type Message, type Toast, type ToasterProps, type ToastHandler, type ToastOptions, type ToastType } from '../types';
import { type DefaultToastOptions, type Renderable, resolveValue, type ValueOrFunction } from '../types';
import { generateID } from '../util';
import { defaultTimeouts, defaultToasterOptions, defaultToastOptions } from './defaults';
import { dispatch, store } from './store';

export const [defaultOpts, setDefaultOpts] = createSignal<ToasterProps>(defaultToasterOptions);

export const createToast = (message: Message, type: ToastType, options: ToastOptions): Toast => ({
  ...defaultToastOptions,
  ...defaultOpts().toastOptions,
  ...options,
  createdAt: Date.now(),
  duration: options.duration || defaultOpts().toastOptions?.duration || defaultTimeouts[type],
  id: options.id || generateID(),
  message,
  paused: false,
  pauseDuration: 0,
  position:
    options.position || defaultOpts().toastOptions?.position || defaultOpts().position || defaultToastOptions.position,
  style: {
    ...defaultToastOptions.style,
    ...defaultOpts().toastOptions?.style,
    ...options.style,
  },
  type,
  visible: true,
});

const createToastCreator =
  (type?: ToastType): ToastHandler =>
  (message: Message, options: ToastOptions = {}) => {
    return createRoot(() => {
      const existingToast = store.toasts.find((t) => t.id === options.id) as Toast;
      const toast = createToast(message, type, { ...existingToast, duration: undefined, ...options });
      dispatch({ toast, type: ActionType.UPSERT_TOAST });
      return toast.id;
    });
  };

const toast = (message: Message, opts?: ToastOptions) => createToastCreator('blank')(message, opts);
const _test = untrack(() => toast);

toast.error = createToastCreator('error');
toast.success = createToastCreator('success');
toast.loading = createToastCreator('loading');
toast.custom = createToastCreator('custom');

toast.dismiss = (toastId?: string) => {
  dispatch({
    toastId,
    type: ActionType.DISMISS_TOAST,
  });
};

toast.promise = <T>(
  promise: Promise<T>,
  msgs: {
    error: ValueOrFunction<Renderable, any>;
    loading: Renderable;
    success: ValueOrFunction<Renderable, T>;
  },
  opts?: DefaultToastOptions
) => {
  const id = toast.loading(msgs.loading, { ...opts });

  promise
    .then((p) => {
      toast.success(resolveValue(msgs.success, p), {
        id,
        ...opts,
      });
      return p;
    })
    .catch((e) => {
      toast.error(resolveValue(msgs.error, e), {
        id,
        ...opts,
      });
    });

  return promise;
};

toast.remove = (toastId?: string) => {
  dispatch({
    toastId,
    type: ActionType.REMOVE_TOAST,
  });
};

export { toast };
