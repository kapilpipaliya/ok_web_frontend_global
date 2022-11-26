import { describe, expect, test } from "vitest";
import { graph } from "../lib/graph";
import { createUniqueId } from "solid-js";
import { klona } from "klona";
import {
 addNewEdge,
 deleteEdge,
 newEdge,
 replaceEdgeProperties,
 updateEdgeStartAndEnd
} from "../lib/Edge";
import { addNewVertex, newVertex } from "../lib/Vertex";

describe('addNewEdge', () => {
 test('modifying Edge dont change store', async() => {
  // in solid when we set an object to the store, we can mutate store with original object reference
  // to prevent accidental behaviour we clone the object.
  const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
  const vertex2 = newVertex(createUniqueId(), ['hello'], {a: 6, b: 7, c: [8, 9, 10]});
  addNewVertex(vertex1);
  addNewVertex(vertex2);
  const Edge1 = newEdge(createUniqueId(), 'hello', {a: 11, b: 12, c: [13, 14, 15]}, vertex1.id, vertex2.id);
  addNewEdge((Edge1));
  Edge1.properties.a = 3;
  expect(graph.edges[Edge1.id].properties.a).to.eq(11);
 })

 test('Edge revert transaction', async() => {
  const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
  const vertex2 = newVertex(createUniqueId(), ['hello'], {a: 6, b: 7, c: [8, 9, 10]});
  addNewVertex(vertex1);
  addNewVertex(vertex2);
  const initialStore = klona(graph);
  const Edge1 = newEdge(createUniqueId(), 'hello', {a: 11, b: 12, c: [13, 14, 15]}, vertex1.id, vertex2.id);
  const [id, [revert]] = addNewEdge((Edge1));
  revert();
  expect(graph).toEqual(initialStore);
 })

})
describe('replaceEdgeProperties', () => {
 test('modifying properties dont change store', async() => {
  const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
  const vertex2 = newVertex(createUniqueId(), ['hello'], {a: 6, b: 7, c: [8, 9, 10]});
  addNewVertex(vertex1);
  addNewVertex(vertex2);
  const Edge1 = newEdge(createUniqueId(), 'hello', {a: 11, b: 12, c: [13, 14, 15]}, vertex1.id, vertex2.id);
  addNewEdge((Edge1));
  const newProperties = {a: 13, d: 14};
  replaceEdgeProperties(Edge1.id, newProperties);
  expect(graph.edges[Edge1.id].properties.a).to.eq(13);
  newProperties.a = 1;
  expect(graph.edges[Edge1.id].properties.a).to.eq(13);
 })

 test('Edge revert replace Properties', async() => {
  const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
  const vertex2 = newVertex(createUniqueId(), ['hello'], {a: 6, b: 7, c: [8, 9, 10]});
  addNewVertex(vertex1);
  addNewVertex(vertex2);
  const Edge1 = newEdge(createUniqueId(), 'hello', {a: 11, b: 12, c: [13, 14, 15]}, vertex1.id, vertex2.id);
  addNewEdge((Edge1));
  const initialStore = klona(graph);
  const newProperties = {a: 6, d: 7};
  const [id, [revert]] = replaceEdgeProperties(Edge1.id, newProperties);
  revert();
  expect(graph).toEqual(initialStore);
 })
})

describe('updateEdgeStartAndEnd', () => {
 const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
 const vertex2 = newVertex(createUniqueId(), ['hello'], {a: 6, b: 7, c: [8, 9, 10]});
 const vertex3 = newVertex(createUniqueId(), ['hello'], {a: 11, b: 12, c: [13, 14, 15]});
 addNewVertex(vertex1);
 addNewVertex(vertex2);
 addNewVertex(vertex3);
 const Edge1 = newEdge(createUniqueId(), 'hello', {a: 16, b: 17, c: [18, 19, 20]}, vertex1.id, vertex2.id);
 const Edge2 = newEdge(createUniqueId(), 'hello', {a: 16, b: 17, c: [18, 19, 20]}, vertex1.id, vertex3.id);
 addNewEdge((Edge1));
 addNewEdge((Edge2));
 const initialStore = klona(graph);
 const [id, revertTxn] = updateEdgeStartAndEnd(Edge2.id, vertex2.id, vertex1.id);
 revertTxn.forEach(revert => revert());
 expect(graph).toEqual(initialStore);

})

describe('deleteEdge', () => {
 const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
 const vertex2 = newVertex(createUniqueId(), ['hello'], {a: 6, b: 7, c: [8, 9, 10]});
 addNewVertex(vertex1);
 addNewVertex(vertex2);
 const Edge1 = newEdge(createUniqueId(), 'hello', {a: 11, b: 12, c: [13, 14, 15]}, vertex1.id, vertex2.id);
 addNewEdge((Edge1));
 const initialStore = klona(graph);
 const [id, [revert]] = deleteEdge(Edge1.id);
 revert();
 expect(graph).toEqual(initialStore);
})