export interface NestedExpression {
  expression: string;
  incoming?: NestedExpression[];
  outgoing?: NestedExpression[];
  /** Resolve edges on the server from FormMetaData — prefer over nested incoming/outgoing. */
  formKey?: string;
  /** Skip TableField/DynamicTable nests (grid list fetches). */
  ignoreTables?: boolean;
}
