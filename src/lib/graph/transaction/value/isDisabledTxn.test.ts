import { describe, it, expect } from "vitest";
import { isDisabledTxn } from "./isDisabledTxn";
import { graphWithTxn } from "../__tests__/fixtures";

describe("isDisabledTxn", () => {
  it("is disabled for falsy txnId or missing vertex", () => {
    const { graph } = graphWithTxn(1);
    expect(isDisabledTxn(0, graph)).toBe(true);
    expect(isDisabledTxn(99, graph)).toBe(true);
  });

  it("is disabled when status is error", () => {
    const { graph } = graphWithTxn(1, { status: "error" });
    expect(isDisabledTxn(1, graph)).toBe(true);
  });

  it("is disabled when there is nothing to commit", () => {
    const { graph } = graphWithTxn(1, {
      activeUndoIndex: 1,
      submittedIndex: 1,
      originalSubmittedIndex: 1,
      revertSteps: [],
      status: "committed",
    });
    expect(isDisabledTxn(1, graph)).toBe(true);
  });

  it("is enabled when there are changes to commit", () => {
    const { graph } = graphWithTxn(1, {
      activeUndoIndex: 2,
      submittedIndex: 0,
      status: "modified",
    });
    expect(isDisabledTxn(1, graph)).toBe(false);
  });
});
