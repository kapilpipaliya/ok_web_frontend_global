import { describe, it, expect } from "vitest";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

describe("getEdgesFromRowsAttr", () => {
  const selectOut: FieldAttribute = {
    componentName: "Select",
    key: "owner",
    inward: false,
  } as FieldAttribute;

  const selectIn: FieldAttribute = {
    componentName: "MultiSelect",
    parentLabel: "user",
    childLabel: "role",
    inward: true,
  } as FieldAttribute;

  it("builds outgoing and incoming expressions for select fields", () => {
    const result = getEdgesFromRowsAttr([selectOut, selectIn]);
    expect(result.outgoing).toEqual([{ expression: "->$0Owner" }]);
    expect(result.incoming).toEqual([{ expression: "<-UserRole" }]);
  });

  it("nests table field children and respects ignoreTables", () => {
    const table: FieldAttribute = {
      componentName: "TableField",
      key: "items",
      inward: false,
      attributes: [selectOut],
    } as FieldAttribute;
    const hiddenTable: FieldAttribute = {
      componentName: "DynamicTable",
      hideInGrid: true,
      key: "hidden",
      inward: false,
    } as FieldAttribute;

    const withTable = getEdgesFromRowsAttr([table]);
    expect(withTable.outgoing[0].expression).toBe("->$0Items");
    expect(withTable.outgoing[0].outgoing).toEqual([{ expression: "->$0Owner" }]);

    const ignored = getEdgesFromRowsAttr([hiddenTable, table], true);
    expect(ignored.outgoing).toHaveLength(0);
  });

  it("skips attributes with ignoreFetch", () => {
    const skipped: FieldAttribute = {
      componentName: "Select",
      key: "skip",
      ignoreFetch: true,
      inward: false,
    } as FieldAttribute;
    expect(getEdgesFromRowsAttr([skipped]).outgoing).toEqual([]);
  });
});
