import type { JSX } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

export interface GenericComponentProps {
  children?: JSX.Element;
  componentName?: string;
  data?: Vertex;
  disabled?: boolean;
  isRealTime?: boolean;
  isTableInside?: boolean;
  meta: Vertex;
  onChange?(data: any): void;
  title?: string;
  txnId: number;
  value?: any;
}

export interface DisplayComponentProps {
  data?: Vertex;
  meta?: Vertex;
}
