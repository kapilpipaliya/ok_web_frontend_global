import { Component, Show } from "solid-js";
import { Renderable, toast, ValueOrFunction } from "solid-toast";
import { Icon } from "@iconify-icon/solid";

const DismissButton: Component<{
  onDismiss: () => void;
}> = (props) => {
  return (
    <button
      style={{
        "background-color": "rgba(229, 231, 235, 0.8)", // bg-gray-200/80
        display: "flex", // flex
        "justify-content": "center", // justify-center
        "align-items": "center", // items-center
        width: "1.5rem", // w-6
        height: "1.5rem", // h-6
        position: "absolute", // absolute
        right: "0.625rem", // right-2.5
        top: "50%", // top-1/2
        transform: "translateY(-50%)", // -translate-y-1/2
        "border-radius": "9999px", // rounded-full
      }}
      onClick={props.onDismiss}
    >
      &times;
    </button>
  );
};

type ValueOrFunction<T, Args> = T | ((args: Args) => T);

interface LoadingToastParams<T extends { [key: string]: any }> {
  promise: Promise<T>;
  loadMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  successJSXFn?: ValueOrFunction<Renderable, T>;
  errorJSXFn?: ValueOrFunction<Renderable, any>;
  onSuccess?: (value: T) => void;
  onError?: (error: any) => void;
}

export const useToast = () => {
  function showCustomToast(message: string, showDismiss: boolean) {
    toast.custom(
      (t) => (
        <div
          style={{
            padding: "0.75rem 3rem 0.75rem 1.5rem", // px-6 py-3 pr-12
            "background-color": "white", // bg-white
            "border-radius": "10px", // rounded-full
            "box-shadow":
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-md
            "font-weight": "500", // font-medium
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
    promise,
    loadMessage = "Processing...",
    successMessage,
    errorMessage,
    successJSXFn,
    errorJSXFn,
    onSuccess,
    onError,
  }: LoadingToastParams<T>) {
    await toast.promise(promise, {
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
      error: (e: any) => {
        onError?.(e);
        return (
          <span>
            {errorMessage ?? e.message ?? "Oops! Something went wrong"}
          </span>
        );
      },
    });
  }

  function showErrorToast(message: string) {
    toast.error(message);
  }

  function showWarningToast(message: string) {
    toast.error(message, {
      icon: (
        <Icon
          icon={"mingcute:warning-line"}
          height={27}
          width={27}
          style={{ color: "#009cfa" }}
        />
      ),
    });
  }

  return {
    showCustomToast,
    showLoadingToast,
    showErrorToast,
    showSuccessToast,
    showWarningToast,
  };
};
