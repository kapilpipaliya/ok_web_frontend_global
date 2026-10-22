import { describe, expect, it } from "vitest";
import { getTextValue } from "./getTextValue";

describe("getTextValue", () => {
  it("stringifies booleans and objects", () => {
    expect(getTextValue(true)).toBe("true");
    expect(getTextValue(false)).toBe("false");
    expect(getTextValue({ a: 1 })).toBe('{"a":1}');
  });

  it("passes through other primitives", () => {
    expect(getTextValue("hi")).toBe("hi");
    expect(getTextValue(42)).toBe(42);
    expect(getTextValue(null)).toBe("null");
  });
});
