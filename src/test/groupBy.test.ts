import { describe, expect, test } from "vitest";
import { graph } from "../lib/graph";
import { createUniqueId } from "solid-js";
import { klona } from "klona";
import { addNewVertex, deleteVertex, newVertex, replaceVertexProperties } from "../lib/Vertex";


function groupBy(xs, groupFn) {
 return xs.reduce((acc, element) => {
  const key = groupFn(element);
  const value = acc[key];
  if (value !== void 0) {
   value.push(element);
  } else {
   acc[key] = [element];
  }
  return acc;
 }, {});
}


describe('addNewVertex', () => {
 test('modifying vertex dont change store', async() => {

  expect(groupBy([
   { Phase: "Phase 1", Step: "Step 1", Task: "Task 1", Value: "5" },
   { Phase: "Phase 1", Step: "Step 1", Task: "Task 2", Value: "10" },
   { Phase: "Phase 1", Step: "Step 2", Task: "Task 1", Value: "15" },
   { Phase: "Phase 1", Step: "Step 2", Task: "Task 2", Value: "20" },
   { Phase: "Phase 2", Step: "Step 1", Task: "Task 1", Value: "25" },
   { Phase: "Phase 2", Step: "Step 1", Task: "Task 2", Value: "30" },
   { Phase: "Phase 2", Step: "Step 2", Task: "Task 1", Value: "35" },
   { Phase: "Phase 2", Step: "Step 2", Task: "Task 2", Value: "40" }
  ], row=>row.Phase)).toEqual([
   { Phase: "Phase 1", Value: 50 },
   { Phase: "Phase 2", Value: 130 }
  ])
 })

})
