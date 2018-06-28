import 'rxjs-compat'
import { Observable as $ } from 'rxjs/Observable'
import { BehaviorsF$ } from './behaviors'

interface Behaviors {
  a: number
  b: string
  c: { a: number, b: string }
}

const start: Behaviors = {
  a: 1, b: 'B', c: { a: 2, b: 'B' }
}

test('behaviors - basic', () => {
  const bh = new BehaviorsF$<Behaviors>(start)
  const { a, b, c } = bh.$s()
  return $.zip(a, b, c)
    .take(2)
    .do(([a, b, c]) => {
      bh.fire('a')(a); bh.fire('b')(b); bh.fire('c')(c)
    })
    .do(([a, b, c]) => {
      expect(a).toBe(start.a)
      expect(b).toBe(start.b)
      expect(c).toBe(start.c)
      expect(a).toBe(bh.v('a'))
      expect({ b, c }).toEqual(bh.vs(['b', 'c']))
    })
    .toPromise()
})

test('behaviors - reset', () => {
  const bh = new BehaviorsF$<Behaviors>(start)
  const { a, b } = bh.$s()
  return $.zip(a, b)
    .take(2)
    .do(() => {
      bh.fire('a')(3); bh.fire('b')('BB')
    })
    .last()
    .do(() => { expect(bh.v('a')).toBe(3); expect(bh.v('b')).toBe('BB') })
    .do(() => bh.reset())
    .do(() => { expect(bh.vs()).toEqual(start) })
    .do(() => { bh.fire('a')(3); expect(bh.v('a')).toBe(3) })
    .do(() => { bh.reset('a'); expect(bh.v('a')).toBe(start.a) })
    .toPromise()
})

test('behaviors - updated', () => {
  const bh = new BehaviorsF$<{ count: number }>({ count: 0 })
  bh.update('count')(o => o + 1)
  expect(bh.v('count')).toBe(1)
  const two = 2
  bh.update('count')(o => o + two)
  expect(bh.v('count')).toBe(3)
})
