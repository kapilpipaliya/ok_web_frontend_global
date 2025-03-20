import { Icon } from "@iconify-icon/solid";
import {
  type Component,
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  Show,
} from "solid-js";

import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { toastValue } from "~/toastValue";

type Renderable = JSX.Element;

const DismissButton: Component<{
  onDismiss: () => void;
}> = (props) => {
  return (
    <button
      class="align-items:center background-color:rgba(229,|231,|235,|0.8) border-radius:9999px display:flex height:1.5rem justify-content:center position:absolute right:0.625rem top:50% transform:translateY(-50%) width:1.5rem"
      onClick={props.onDismiss}
    >
      &times;
    </button>
  );
};

interface LoadingToastParams<T extends { [key: string]: any }> {
  errorJSXFn?: ValueOrFunction<Renderable, any>;
  errorMessage?: string;
  loadMessage?: string;
  onError?: (error: unknown) => void;
  onSuccess?: (value: T) => void;
  promise: Promise<T>;
  successJSXFn?: ValueOrFunction<Renderable, T>;
  successMessage?: string;
}

type ValueOrFunction<T, Args> = ((args: Args) => T) | T;

export function useToast() {
  function showCustomToast(message: string, showDismiss: boolean) {
    toastValue.toast.custom(
      (t) => (
        <div class="background-color:base-5 border-radius:10px box-shadow:0|4px|6px|-1px|rgba(0,0,0,0.1),0|2px|4px|-1px|rgba(0,0,0,0.06) font-weight:500 padding:0.75rem|3rem|0.75rem|1.5rem position:relative">
          <div class="flex ai:center jc:center">
            <div>{message}</div>
            <Show when={showDismiss}>
              <DismissButton
                onDismiss={() => {
                  toastValue.toast.dismiss(t.id);
                }}
              />
            </Show>
          </div>
        </div>
      ),
      {
        duration: 5000000,
      },
    );
  }

  function showSuccessToast(message: string) {
    toastValue.toast.success(message, { duration: 3000 });
  }

  async function showLoadingToast<T extends { [key: string]: any }>({
    errorJSXFn,
    errorMessage,
    loadMessage = "Processing...",
    onError,
    onSuccess,
    promise,
    successJSXFn,
    successMessage,
  }: LoadingToastParams<T>) {
    await toastValue.toast.promise(
      promise,
      {
        error:
          errorJSXFn ??
          ((e: unknown) => {
            onError?.(e);
            return (
              <span>
                {errorMessage ??
                  getErrorMessage(e) ??
                  "Oops! Something went wrong"}
              </span>
            );
          }),
        loading: loadMessage,
        success:
          successJSXFn ??
          ((val: T) => {
            onSuccess?.(val);
            return (
              <span>
                {successMessage ??
                  (val.message as string) ??
                  "Successfully completed"}
              </span>
            );
          }),
      },
      {
        duration: 3000,
      },
    );
  }

  function showErrorToast(message: string) {
    toastValue.toast.error(message);
  }

  function showWarningToast(message: string) {
    toastValue.toast.error(message, {
      icon: (
        <Icon
          height={27}
          icon={"mingcute:warning-line"}
          noobserver
          style={{ color: "#009cfa" }}
          width={27}
        />
      ),
    });
  }

  function showTimerToast(title: string, subtitle?: string, timer?: number) {
    const duration = timer ?? 5000;
    toastValue.toast.custom(
      (t) => {
        // Start with 100% life
        const [life, setLife] = createSignal(100);
        const startTime = Date.now();
        createEffect(() => {
          if (toastValue.store[0].pausedAt) {
            return;
          }
          const interval = setInterval(() => {
            const diff = Date.now() - startTime - t.pauseDuration;
            setLife(100 - (diff / duration) * 100);
          });

          onCleanup(() => clearInterval(interval));
        });

        return (
          <div
            class={`animation:${t.visible ? "enterAnimation|1s|forwards" : "leaveAnimation|1s|forwards"} background-color:#0891b2 border-radius:6px box-shadow:0|4px|6px|-1px|rgba(0,0,0,0.1),0|2px|4px|-2px|rgba(0,0,0,0.1) min-width:350px padding:12px`}
          >
            <div class="display:flex gap:8px">
              <div class="display:flex flex-direction:column flex:1">
                <div class="color:base-5 font-weight:medium">{title}</div>
                <div class="color:#ecfeff font-size:13px">{subtitle}</div>
              </div>
              <div class="items-center flex">
                <button
                  class="background-color:#0e7490 border-radius:6px color:base-5 font-size:13px font-weight:500 height:80% letter-spacing:0.025em padding:14px"
                  onClick={() => toastValue.toast.dismiss(t.id)}
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#0e7490")
                  }
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(14,116,144,0.7)")
                  }
                >
                  CANCEL
                </button>
              </div>
              <div class="items-center flex">
                <button
                  class="align-items:center background-color:rgba(14,116,144,0.4) border-radius:6px color:base-5 display:flex font-size:24px height:80% letter-spacing:0.025em padding:10px position:relative"
                  onClick={() => toastValue.toast.dismiss(t.id)}
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(14,116,144,0.4)")
                  }
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(14,116,144,0.2)")
                  }
                >
                  x
                </button>
              </div>
            </div>
            <div class="padding-top:16px position:relative">
              <div class="background-color:#164e63 border-radius:9999px height:4px width:100%" />
              <div
                class={`background-color:#ecfeff border-radius:9999px height:4px position:absolute top:16px width:${life()}%`}
              />
            </div>
          </div>
        );
      },
      {
        duration: duration,
      },
    );
  }

  return {
    showCustomToast,
    showErrorToast,
    showLoadingToast,
    showSuccessToast,
    showTimerToast,
    showWarningToast,
  };
}
