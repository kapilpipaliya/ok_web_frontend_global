import type { JSX } from "solid-js";

export interface GenericComponentProps {
  children?: JSX.Element;
  componentName?: string;
  // data?: Vertex;
  disabled?: boolean;
  isRealTime?: boolean;
  isTableInside?: boolean;
  // meta: Vertex;
  onChange?(data: any): void;
  title?: string;
  txnId: number;
  value?: any;
}

export type DisplayComponentProps = {}
