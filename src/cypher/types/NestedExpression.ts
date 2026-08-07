export interface NestedExpression {
  expression: string;
  incoming?: NestedExpression[];
  outgoing?: NestedExpression[];
  /**
   * Prefer this over sending `incoming`/`outgoing` across `/_server`.
   * Page/Component NestedExpression trees exceed SolidStart seroval depthLimit (64).
   * Resolved to edges on the server via FormMetaData[formKey].
   */
  formKey?: string;
  /** When true, TableField/DynamicTable nests are skipped (grid list fetches). */
  ignoreTables?: boolean;
}
