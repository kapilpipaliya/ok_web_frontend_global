import type { JSX } from "solid-js";

export type DisplayComponentProps = {};

export interface GenericComponentProps {
  children?: JSX.Element;
  componentName?: string;
  disabled?: boolean;
  isRealTime?: boolean;
  isTableInside?: boolean;
  onChange?(data: any): void;
  title?: string;

  value?: any;
}
