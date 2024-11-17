import type { Toast } from ".";

export enum ActionType {
  ADD_TOAST = 0,
  DISMISS_TOAST = 3,
  END_PAUSE = 6,
  REMOVE_TOAST = 4,
  START_PAUSE = 5,
  UPDATE_TOAST = 1,
  UPSERT_TOAST = 2,
}

export type Action =
  | {
      time: number;
      type: ActionType.END_PAUSE;
    }
  | {
      time: number;
      type: ActionType.START_PAUSE;
    }
  | {
      toast: Partial<Toast>;
      type: ActionType.UPDATE_TOAST;
    }
  | {
      toast: Toast;
      type: ActionType.ADD_TOAST;
    }
  | {
      toast: Toast;
      type: ActionType.UPSERT_TOAST;
    }
  | {
      toastId?: string;
      type: ActionType.DISMISS_TOAST;
    }
  | {
      toastId?: string;
      type: ActionType.REMOVE_TOAST;
    };

export interface State {
  pausedAt: number | undefined;
  toasts: Toast[];
}
