import { describe, expect, test } from 'vitest'
import { newVertex } from "../lib/graph";
import { G } from "@mobily/ts-belt";

describe('<Hello />', () => {
 test('newVertex', () => {
  expect(newVertex()).to.eq(1)
 })

 test('updates', async() => {
  expect('2').to.eq('2')
 })
})

describe('ts-belt teset', () => {
 expect(G.isNot(39, G.isString)).to.eq(true)
})