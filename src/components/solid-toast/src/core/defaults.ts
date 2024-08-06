import type { JSX } from 'solid-js';

import type { ToasterProps, ToastOptions, ToastTimeouts } from '../types';

export const defaultTimeouts: ToastTimeouts = {
  blank: 4000,
  custom: 4000,
  error: 4000,
  loading: Number.POSITIVE_INFINITY,
  success: 2000,
};

export const defaultToastOptions: Required<ToastOptions> = {
  ariaProps: {
    'aria-live': 'polite',
    role: 'status',
  },
  className: '',
  duration: 3000,
  icon: '',
  iconTheme: {},
  id: '',
  position: 'top-right',
  style: {},
  unmountDelay: 500,
};

export const defaultToasterOptions: ToasterProps = {
  containerClassName: '',
  containerStyle: {},
  gutter: 8,
  position: 'top-right',
  toastOptions: defaultToastOptions,
};

const defaultContainerPadding = '16px';

export const defaultContainerStyle: JSX.CSSProperties = {
  bottom: defaultContainerPadding,
  left: defaultContainerPadding,
  'pointer-events': 'none',
  position: 'fixed',
  right: defaultContainerPadding,
  top: defaultContainerPadding,
  'z-index': 9999,
};
