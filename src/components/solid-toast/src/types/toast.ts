import type { JSX } from 'solid-js';

export type ToastType = 'blank' | 'custom' | 'error' | 'loading' | 'success';
export type ToastPosition = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';

export type Renderable = JSX.Element | null | string;

export type ValueFunction<TValue, TArg> = (arg: TArg) => TValue;
export type ValueOrFunction<TValue, TArg> = TValue | ValueFunction<TValue, TArg>;

const isFunction = <TValue, TArg>(
  valOrFunction: ValueOrFunction<TValue, TArg>
): valOrFunction is ValueFunction<TValue, TArg> => typeof valOrFunction === 'function';

export const resolveValue = <TValue, TArg>(valOrFunction: ValueOrFunction<TValue, TArg>, arg: TArg): TValue =>
  isFunction(valOrFunction) ? valOrFunction(arg) : valOrFunction;

export interface IconTheme {
  primary?: string;
  secondary?: string;
}

export interface Toast {
  ariaProps: {
    'aria-live': 'assertive' | 'off' | 'polite';
    role: 'alert' | 'status';
  };
  className?: string;
  createdAt: number;
  duration?: number;
  height?: number;
  icon?: Renderable;
  iconTheme?: IconTheme;
  id: string;

  message: ValueOrFunction<Renderable, Toast>;

  paused: boolean;
  pauseDuration: number;

  position?: ToastPosition;

  style?: JSX.CSSProperties;
  type: ToastType;
  unmountDelay: number;
  updatedAt?: number;
  visible: boolean;
}

export type ToastOptions = Partial<
  Pick<
    Toast,
    'ariaProps' | 'className' | 'duration' | 'icon' | 'iconTheme' | 'id' | 'position' | 'style' | 'unmountDelay'
  >
>;

export type ToastTimeouts = {
  [key in ToastType]: number;
};

export type DefaultToastOptions = ToastOptions;

export type Message = ValueOrFunction<Renderable, Toast>;

export type ToastHandler = (message: Message, options?: ToastOptions) => string;

export interface ToasterProps {
  containerClassName?: string;
  containerStyle?: JSX.CSSProperties;
  gutter?: number;
  position?: ToastPosition;
  toastOptions?: DefaultToastOptions;
}

export interface ToastContainerProps {
  toast: Toast;
}

export interface ToastBarProps {
  position: ToastPosition;
  toast: Toast;
}

export type IconProps = Partial<IconTheme>;
