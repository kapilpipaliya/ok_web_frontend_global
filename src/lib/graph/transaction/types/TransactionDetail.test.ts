import { describe, expect, it } from "vitest";
import {
  determineTransactionStatus,
  hasChangesToCommit,
  hasRevertedCommittedChanges,
  hasUncommittedChanges,
  isAtRedoneCommittedState,
  isFullyCommitted,
  type TransactionDetail,
} from "./TransactionDetail";

function txn(partial: Partial<TransactionDetail>): TransactionDetail {
  return {
    activeUndoIndex: -1,
    namedUndoStepIndexes: {},
    originalSubmittedIndex: -1,
    preventUndoBeforeIndex: -1,
    revertSteps: [],
    steps: [],
    submittedIndex: -1,
    undoStepIndexes: [],
    status: "idle",
    lastModified: 0,
    ...partial,
  };
}

describe("TransactionDetail helpers", () => {
  it("hasUncommittedChanges when active > submitted", () => {
    expect(
      hasUncommittedChanges(txn({ activeUndoIndex: 2, submittedIndex: 1 })),
    ).toBe(true);
    expect(
      hasUncommittedChanges(txn({ activeUndoIndex: 1, submittedIndex: 1 })),
    ).toBe(false);
  });

  it("hasRevertedCommittedChanges when active < originalSubmitted", () => {
    expect(
      hasRevertedCommittedChanges(
        txn({ activeUndoIndex: 0, originalSubmittedIndex: 2 }),
      ),
    ).toBe(true);
    expect(
      hasRevertedCommittedChanges(
        txn({ activeUndoIndex: 2, originalSubmittedIndex: 2 }),
      ),
    ).toBe(false);
  });

  it("isAtRedoneCommittedState when active===submitted < original", () => {
    expect(
      isAtRedoneCommittedState(
        txn({
          activeUndoIndex: 1,
          submittedIndex: 1,
          originalSubmittedIndex: 3,
        }),
      ),
    ).toBe(true);
    expect(
      isAtRedoneCommittedState(
        txn({
          activeUndoIndex: 1,
          submittedIndex: 1,
          originalSubmittedIndex: 1,
        }),
      ),
    ).toBe(false);
  });

  it("isFullyCommitted only at committed tip with empty revertSteps", () => {
    expect(
      isFullyCommitted(
        txn({
          activeUndoIndex: 2,
          submittedIndex: 2,
          originalSubmittedIndex: 2,
          status: "committed",
          revertSteps: [],
        }),
      ),
    ).toBe(true);
    expect(
      isFullyCommitted(
        txn({
          activeUndoIndex: 2,
          submittedIndex: 2,
          originalSubmittedIndex: 2,
          status: "committed",
          revertSteps: [{ id: "x" } as never],
        }),
      ),
    ).toBe(false);
  });

  it("determineTransactionStatus covers error/reverted/committed/modified", () => {
    expect(determineTransactionStatus(txn({ status: "error" }))).toBe("error");
    expect(
      determineTransactionStatus(
        txn({ activeUndoIndex: 0, originalSubmittedIndex: 2 }),
      ),
    ).toBe("reverted");
    expect(
      determineTransactionStatus(
        txn({
          activeUndoIndex: 2,
          submittedIndex: 2,
          originalSubmittedIndex: 2,
        }),
      ),
    ).toBe("committed");
    expect(
      determineTransactionStatus(
        txn({
          activeUndoIndex: 1,
          submittedIndex: 1,
          originalSubmittedIndex: 3,
        }),
      ),
    ).toBe("reverted");
    expect(
      determineTransactionStatus(
        txn({
          activeUndoIndex: 3,
          submittedIndex: 1,
          originalSubmittedIndex: 1,
        }),
      ),
    ).toBe("modified");
  });

  it("hasChangesToCommit", () => {
    expect(
      hasChangesToCommit(
        txn({
          activeUndoIndex: 2,
          submittedIndex: 2,
          originalSubmittedIndex: 2,
          status: "committed",
        }),
      ),
    ).toBe(false);
    expect(
      hasChangesToCommit(
        txn({
          activeUndoIndex: 3,
          submittedIndex: 2,
          originalSubmittedIndex: 2,
          status: "modified",
        }),
      ),
    ).toBe(true);
    expect(hasChangesToCommit(txn({ status: "reverted" }))).toBe(true);
  });
});
