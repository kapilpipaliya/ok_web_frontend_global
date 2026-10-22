import { describe, expect, it } from "vitest";
import { getViewValue } from "./getViewValue";

describe("getViewValue", () => {
  it("formats booleans and empty values", () => {
    expect(getViewValue(true)).toBe("True");
    expect(getViewValue(false)).toBe("False");
    expect(getViewValue(null)).toBe("");
    expect(getViewValue(undefined)).toBe("");
    expect(getViewValue(0)).toBe("");
    expect(getViewValue("")).toBe("");
  });

  it("joins arrays and stringifies objects", () => {
    expect(getViewValue(["a", true, false])).toBe("a, True, False");
    expect(getViewValue({ x: 1 })).toBe('{"x":1}');
    expect(getViewValue("ok")).toBe("ok");
  });
});
