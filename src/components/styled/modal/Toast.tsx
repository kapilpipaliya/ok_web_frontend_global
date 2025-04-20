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
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

type Renderable = JSX.Element;

const DismissButton: Component<{
  onDismiss: () => void;
}> = (props) => {
  return (
    <As as="button"
      css={css`
  align-items: center;
  background-color: rgba(229, 231, 235, 0.8);
  border-radius: 9999px;
  display: flex;
  height: 1.5rem;
  justify-content: center;
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
`}
      onClick={props.onDismiss}
    >
      &times;
    </As>
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
        <As as="div" css={(args: FunctionArgumentType) => css`
  background-color: ${args.theme.var.color.base_10};
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);
  font-weight: 500;
  padding: 0.75rem 3rem 0.75rem 1.5rem;
  position: relative;
`}>
          <As as="div" css={css`
  display: flex;
  align-items: center;
  justify-content: center;
`}>
            <As as="div">{message}</As>
            <Show when={showDismiss}>
              <DismissButton
                onDismiss={() => {
                  toastValue.toast.dismiss(t.id);
                }}
              />
            </Show>
          </As>
        </As>
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
          <As as="div"
            css={[css`
  animation: ${t.visible ? "enterAnimation 1s forwards" : "leaveAnimation 1s forwards"};
`, css`
  background-color: #0891b2;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  min-width: 350px;
  padding: 12px;
`]}
          >
            <As as="div" css={css`
  display: flex;
  gap: 8px;
`}>
              <As as="div" css={css`
  display: flex;
  flex-direction: column;
  display: flex;
`}>
                <As as="div" css={(args: FunctionArgumentType) => css`
  color: ${args.theme.var.color.base_10};
  font-weight: medium;
`}>{title}</As>
                <As as="div" css={css`
  color: #ecfeff;
  font-size: 13px;
`}>{subtitle}</As>
              </As>
              <As as="div" css={css`
  align-items: center;
  display: flex;
`}>
                <As as="button"
                  css={(args: FunctionArgumentType) => css`
  background-color: ${args.theme.var.color.primary};
  border-radius: 6px;
  color: ${args.theme.var.color.base_10};
  font-size: 13px;
  font-weight: 500;
  height: 80%;
  letter-spacing: 0.025em;
  padding: 14px;
`}
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
                </As>
              </As>
              <As as="div" css={css`
  align-items: center;
  display: flex;
`}>
                <As as="button"
                  css={css`
  align-items: center;
  background-color: rgba(14,116,144,0.4);
  border-radius: 6px;
  color: #1e293b;
  display: flex;
  font-size: 24px;
  height: 80%;
  letter-spacing: 0.025em;
  padding: 10px;
  position: relative;
`}
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
                </As>
              </As>
            </As>
            <As as="div" css={css`
  padding-top: 16px;
  position: relative;
`}>
              <As as="div" css={css`
  background-color: #164e63;
  border-radius: 9999px;
  height: 4px;
  width: 100%;
`} />
              <As as="div" css={css`
  background-color: #ecfeff;
  border-radius: 9999px;
  height: 4px;
  position: absolute;
  top: 16px;
  width: ${life()}%;
`}
              />
            </As>
          </As>
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
