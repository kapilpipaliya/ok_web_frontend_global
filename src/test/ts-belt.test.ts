import { describe, test } from "vitest";

import { mergeDeepRight } from "rambda";
describe('ts-belt merge test', () => {
 beforeEach(() => {

 })
 test('modifying vertex dont change store', async() => {
  const a = mergeDeepRight({ x: 1, y: 2, a: {b: '1', c: 3} }, { y: 3, z: 4, a: {b: '2'} }) //?

 })

 test('vertex revert transaction', async() => {

 })
})

// Fix going in http://localhost:9000/admin/Component/510 and back always add some extra attributes
