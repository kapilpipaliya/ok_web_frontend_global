import { describe, expect, test } from 'vitest'

describe('<Hello />', () => {
  test('cypher run test', () => {
    expect(1).to.eq(1)
  })

  test('updates', async() => {
    expect('2').to.eq('2')
  })
})