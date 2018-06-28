import { PolyF$ } from './poly'
import { RxifireError } from '../utils'

const T = true
const transitions = {
  'a': { b: T, c: T },
  'b': {},
  'c': { a: T }
}

test('poly - simple', () => {
  const p = new PolyF$({ transitions, initial: 'c' })
  expect(p.is('c')).toBe(true)
  expect(() => p.from('a')('c')).toThrowError(RxifireError)
  p.from('c')('a')
  expect(p.is('a')).toBe(true)
  p.from('a')('b')
  expect(p.is('b')).toBe(true)
  // p.from('b')() dead-end
})
