import { describe, expect, it } from "vitest";
import { IdAttr } from "./idAttr";

describe("IdAttr", () => {
  it("is the canonical key property name", () => {
    expect(IdAttr).toBe("key");
  });
});
