import type { Toast, ToastOptions } from './';

export type Action =
  | {
      time: number;
      type: 'end_pause';
    }
  | {
      time: number;
      type: 'start_pause';
    }
  | {
      toast: Partial<Toast>;
      type: 'update';
    }
  | {
      toast: Toast;
      type: 'add';
    }
  | {
      toast: Toast;
      type: 'upsert';
    }
  | {
      toastId?: string;
      type: 'dismiss';
    }
  | {
      toastId?: string;
      type: 'remove';
    };

export interface State {
  pausedAt: number | undefined;
  toasts: Toast[];
}

export interface InitOptions {
  options: ToastOptions[];
}
