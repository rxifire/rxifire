import { PolyF$, PolySpec } from './poly'
import { RxifireError } from '../utils'

const T = true
const transitions = {
  'a': { b: T, c: T },
  'b': {},
  'c': { a: T }
}

const A = {
  a1: { a2: T },
  a2: { a1: T }
}
// const ASpec: PolySpec = {}

test('poly - simple', () => {
  // const pa = new PolyF$()
  // const p = new PolyF$({ transitions, initial: 'c',
  //   down: { a: { transitions: A, initial: 'a1' } } })
  // const d = p.down('a')
  // if (d) d.from('a1')
  const p = new PolyF$({ transitions, initial: 'c' })
  expect(p.is('c')).toBe(true)
  expect(() => p.from('a')('c')).toThrowError(RxifireError)
  p.from('c')('a')
  expect(p.is('a')).toBe(true)
  p.from('a')('b')
  expect(p.is('b')).toBe(true)
  // p.from('b')() dead-end
})
