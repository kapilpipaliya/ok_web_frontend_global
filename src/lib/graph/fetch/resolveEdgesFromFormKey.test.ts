import { describe, expect, it } from "vitest";
import {
  applyFormKeyToExpression,
  DEEP_FORM_META_KEYS,
  isDeepFormMetaKey,
  resolveEdgesFromFormKey,
} from "./resolveEdgesFromFormKey";

describe("resolveEdgesFromFormKey", () => {
  it("isDeepFormMetaKey recognizes deep schemas", () => {
    expect(isDeepFormMetaKey("Page")).toBe(true);
    expect(isDeepFormMetaKey("Component")).toBe(true);
    expect(isDeepFormMetaKey("Unknown")).toBe(false);
    expect(isDeepFormMetaKey(undefined)).toBe(false);
    expect(DEEP_FORM_META_KEYS.has("EmailTemplate")).toBe(true);
  });

  it("resolveEdgesFromFormKey returns undefined for missing keys", () => {
    expect(resolveEdgesFromFormKey(undefined)).toBeUndefined();
    expect(resolveEdgesFromFormKey("TotallyMissingFormKeyXYZ")).toBeUndefined();
  });

  it("applyFormKeyToExpression leaves expression alone without formKey", () => {
    const expression = { label: "Page", ignoreTables: true };
    expect(applyFormKeyToExpression(expression)).toEqual(expression);
  });
});
