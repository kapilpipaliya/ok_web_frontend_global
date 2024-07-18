import type { Vertex } from "~/lib/graph/graph";

export interface GenericComponentProps {
  componentName?: string;
  data?: Vertex;
  disabled?: boolean;
  isRealTime?: boolean;
  isTableInside?: boolean;
  meta: Vertex;
  setValue?(data: any): void;
  title: string;
  txnId: number;
  value: any;
}

export interface DisplayComponentProps {
  data?: Vertex;
  meta?: Vertex;
}
