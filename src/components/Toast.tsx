import { Icon } from "@iconify-icon/solid";
import {
  type Component,
  Show,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { type Renderable, toast } from "solid-toast";

const DismissButton: Component<{
  onDismiss: () => void;
}> = (props) => {
  return (
    <button
      onClick={props.onDismiss}
      style={{
        "align-items": "center", // items-center
        "background-color": "rgba(229, 231, 235, 0.8)", // bg-gray-200/80
        "border-radius": "9999px", // rounded-full
        display: "flex", // flex
        height: "1.5rem", // h-6
        "justify-content": "center", // justify-center
        position: "absolute", // absolute
        right: "0.625rem", // right-2.5
        top: "50%", // top-1/2
        transform: "translateY(-50%)", // -translate-y-1/2
        width: "1.5rem", // w-6
      }}
    >
      &times;
    </button>
  );
};

type ValueOrFunction<T, Args> = ((args: Args) => T) | T;

interface LoadingToastParams<T extends { [key: string]: any }> {
  errorJSXFn?: ValueOrFunction<Renderable, any>;
  errorMessage?: string;
  loadMessage?: string;
  onError?: (error: any) => void;
  onSuccess?: (value: T) => void;
  promise: Promise<T>;
  successJSXFn?: ValueOrFunction<Renderable, T>;
  successMessage?: string;
}

export function useToast() {
  function showCustomToast(message: string, showDismiss: boolean) {
    toast.custom(
      (t) => (
        <div
          style={{
            "background-color": "white", // bg-white
            "border-radius": "10px", // rounded-full
            "box-shadow":
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-md
            "font-weight": "500", // font-medium
            padding: "0.75rem 3rem 0.75rem 1.5rem", // px-6 py-3 pr-12
            position: "relative", // relative
          }}
        >
          <div class={"flex ai:center jc:center"}>
            <div>{message}</div>
            <Show when={showDismiss}>
              <DismissButton
                onDismiss={() => {
                  toast.dismiss(t.id);
                }}
              />
            </Show>
          </div>
        </div>
      ),
      {
        duration: 5000000,
        unmountDelay: 0,
      },
    );
  }

  function showSuccessToast(message: string) {
    toast.success(message, { duration: 2000 });
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
    await toast.promise(promise, {
      error: (e: any) => {
        onError?.(e);
        return (
          <span>
            {errorMessage ?? e.message ?? "Oops! Something went wrong"}
          </span>
        );
      },
      loading: loadMessage,
      success:
        successJSXFn ??
        ((val: T) => {
          onSuccess?.(val);
          return (
            <span>
              {successMessage ?? val.message ?? "Successfully completed"}
            </span>
          );
        }),
    });
  }

  function showErrorToast(message: string) {
    toast.error(message);
  }

  function showWarningToast(message: string) {
    toast.error(message, {
      icon: (
        <Icon
          height={27}
          icon={"mingcute:warning-line"}
          style={{ color: "#009cfa" }}
          width={27}
        />
      ),
    });
  }

  function showTimerToast(title: string, subtitle?: string, timer?: number) {
    const duration = timer ?? 5000;
    toast.custom(
      (t) => {
        // Start with 100% life
        const [life, setLife] = createSignal(100);
        const startTime = Date.now();
        createEffect(() => {
          if (t.paused) return;
          const interval = setInterval(() => {
            const diff = Date.now() - startTime - t.pauseDuration;
            setLife(100 - (diff / duration) * 100);
          });

          onCleanup(() => clearInterval(interval));
        });

        return (
          <div style="animation: ${t.visible ? 'enterAnimation 1s forwards' : 'leaveAnimation 1s forwards'}; background-color: #0891b2; padding: 12px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); min-width: 350px;">
            <div style="display: flex; gap: 8px;">
              <div style="display: flex; flex: 1; flex-direction: column;">
                <div class="font-weight:medium color:white">{title}</div>
                <div style="font-size: 13px; color: #ecfeff;">{subtitle}</div>
              </div>
              <div class="flex items-center">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  // @ts-ignore
                  onMouseOut="this.style.backgroundColor='#0e7490'"
                 // @ts-ignore
                  onMouseOver="this.style.backgroundColor='rgba(14, 116, 144, 0.7)'"
                  style="padding: 14px; height: 80%; letter-spacing: 0.025em; font-weight: 500; border-radius: 6px; font-size: 13px; color: white; background-color: #0e7490;"
                >
                  CANCEL
                </button>
              </div>
              <div class="flex items-center">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  // @ts-ignore
                  onMouseOut="this.style.backgroundColor='rgba(14, 116, 144, 0.4)'"
                  // @ts-ignore
                  onMouseOver="this.style.backgroundColor='rgba(14, 116, 144, 0.2)'"
                  style="padding: 10px; display: flex; align-items: center; position: relative; height: 80%; letter-spacing: 0.025em; border-radius: 6px; font-size: 24px; color: white; background-color: rgba(14, 116, 144, 0.4);"
                >
                  x
                </button>
              </div>
            </div>
            <div style="position: relative; padding-top: 16px;">
              <div style="width: 100%; height: 4px; border-radius: 9999px; background-color: #164e63;" />
              <div
                style={`height: 4px; width: ${life()}%; position: absolute; top: 16px; border-radius: 9999px; background-color: #ecfeff;`}
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
