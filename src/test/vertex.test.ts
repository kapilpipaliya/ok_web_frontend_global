import { describe, expect, test } from "vitest";
import { graph } from "../lib/graph";
import { createUniqueId } from "solid-js";
import { klona } from "klona";
import { addNewVertex, deleteVertex, newVertex, replaceVertexProperties } from "../lib/Vertex";

describe('addNewVertex', () => {
 test('modifying vertex dont change store', async() => {
  // in solid when we set an object to the store, we can mutate store with original object reference
  // to prevent accidental behaviour we clone the object.
  const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
  addNewVertex((vertex1));
  vertex1.properties.a = 3;
  expect(graph.vertexes[vertex1.id].properties.a).to.eq(1);
 })

 test('vertex revert transaction', async() => {
  const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
  const vertex2 = newVertex(createUniqueId(), ['hello'], {a: 6, b: 7, c: [8, 9, 10]});
  addNewVertex(vertex1);
  const initialStore = klona(graph);
  const [id, [revert]] = addNewVertex(vertex2);
  revert();
  expect(graph).toEqual(initialStore);
 })

})
describe('replaceVertexProperties', () => {
 test('modifying properties dont change store', async() => {
  const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
  addNewVertex((vertex1));
  const newProperties = {a: 6, d: 7};
  replaceVertexProperties(vertex1.id, newProperties);
  expect(graph.vertexes[vertex1.id].properties.a).to.eq(6);
  newProperties.a = 1
  expect(graph.vertexes[vertex1.id].properties.a).to.eq(6);
 })

 test('vertex revert replace Properties', async() => {
  const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
  const vertex2 = newVertex(createUniqueId(), ['hello'], {a: 6, b: 7, c: [8, 9, 10]});
  addNewVertex(vertex1);
  addNewVertex(vertex2);
  const initialStore = klona(graph);
  const newProperties = {a: 6, d: 7};
  const [id, [revert]] = replaceVertexProperties(vertex1.id, newProperties);
  revert();
  expect(graph).toEqual(initialStore);
 })
})

describe('deleteVertex', () => {
 const vertex1 = newVertex(createUniqueId(), ['hello'], {a: 1, b: 2, c: [3, 4, 5]});
 const vertex2 = newVertex(createUniqueId(), ['hello'], {a: 6, b: 7, c: [8, 9, 10]});
 addNewVertex(vertex1);
 addNewVertex(vertex2);
 const initialStore = klona(graph);
 const [id, [revert]] = deleteVertex(vertex2.id);
 revert();
 expect(graph).toEqual(initialStore);
})
