/**
 * Sync read-after-write audit for Solid 2 flush migration.
 *
 * On Solid 1, `setGraph` / `produceGraph` updates are visible on the next
 * synchronous read of `graph`. On Solid 2, reads may still see the old value
 * until the microtask batch flushes (or `flush()` is called).
 *
 * Sites below write then immediately read graph/txn state in the same turn.
 * When Solid 2 lands, either call `flush()` after the write or defer the read.
 *
 * ## Core mutate (now draft-first via produceGraph)
 * - addNewVertex → getLastTxnIndex(txnId, graph)
 * - addNewEdge → getLastTxnIndex(txnId, graph); later reads of OUT/IN
 * - mergeVertexProperties → getLastTxnIndex; klona(vertex) after merge
 * - setGraphData / updateVertex / updateEdge → callers read vertexes/edges after
 *
 * ## Transaction helpers
 * - transactionDetailAdd → replaceVertexProperties then callers read txn.P
 * - generateNewTxnId → mergeVertexProperties then addNewVertex; returns txnId
 *   while reading graph.vertexes.globalStoreId.P.txnId_ before/after
 * - commitTxn → reads txnDetail.steps / submittedIndex after prior mutates
 * - updateSubmittedIndex → replace then UI reads status
 * - undo / redo / undoTxn / redoTxn → mutate graph then update txn indexes
 * - resetTransaction / revertTransaction* → delete/replay then read steps
 *
 * ## Channel handlers
 * - handleChannelMessage → addNewVertex/Edge/merge then later branches read
 *   graph.vertexes / graph.edges in the same message handler
 *
 * ## Form / submit paths
 * - setValueGlobal → mergeVertexProperties then onChangeHandler reads vertex
 * - createFormVertex / newRow / addNewRow → add then return graph.vertexes[id]
 * - handleDataSubmission / onMutatDataGet → id remaps then immediate reads
 * - loadForm → setGraphData then form code reads labels/vertexes
 *
 * Keep produceGraph.test.ts asserting Solid 1 sync visibility so Solid 2
 * breaks these intentionally when flush semantics change.
 */

export const READ_AFTER_WRITE_AUDIT_NOTE =
  "See file header for sync read-after-write inventory.";
