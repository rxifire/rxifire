import 'rxjs-compat'
import { Observable as $ } from 'rxjs/Observable'

import { ActionsF$, AsActionsIO, ActionsSpec, Actions } from './index'
import { RxifireError } from '../utils/errors'

// todo: this will be modified once variadic params landed in TS
type IO = AsActionsIO<{
  prom: [number, string, null],
  obs: [string, string[], null],
  obs2: [string, string[], null],
  obs3: [string, string[], null],
  never: [never, never, void]

  ups: [[string, number], string, number]
}>

const acts: Actions<IO> = {
  prom: (n) => Promise.resolve(`${n}`),
  obs: (s) => $.of(s.split('')).delay(1),
  obs2: (s) => $.of(s.split('')).delay(2),
  obs3: (s) => $.of(s.split('')).delay(3),
  never: () => $.never(),

  ups: ([w, d], onUpdate) =>
    $.from(w.split(''))
      .concatMap((l, i) =>
        $.timer(i * d)
          .do(() => onUpdate(i))
          .ignoreElements()
          .merge(i === w.length - 1 ? $.of(w) : $.empty()))
}

const spec: ActionsSpec<IO> = {
  prom: {
    inProgressRefire: 'ignore'
  },
  // obs2: {
  //   inProgressRefire: 'join'
  // },
  obs3: {
    inProgressRefire: 'stop-then-refire'
  },
  never: {
    warnAfter: 4, timeout: 10
  }
}

let ctr: ActionsF$<IO>

beforeEach(() => ctr = new ActionsF$(acts, spec))

test('actions - idle', () => {
  expect(ctr.is('obs', 'idle')).toBe(true)
  expect(ctr.meta('never').status).toBe('idle')
})

test('actions - meta start', () => {
  const m = ctr.meta('obs')
  const ks = Object.keys(m)
    .filter(k => (m as any)[k] !== undefined)
  expect(ks.length).toBe(1)
  expect(ks[0]).toBe('status')
})

test('actions - as throws', () => {
  expect(ctr.as('never', 'idle')).toBeTruthy()
  expect(() => ctr.as('obs', 'in-progress')).toThrowError(RxifireError)
  expect(() => ctr.as('prom', 'success')).toThrowError(RxifireError)
  expect(() => ctr.as('never', 'error')).toThrowError(RxifireError)
})

test('actions - simple fire', () =>
  ctr.fire('prom')(2)
    .do(x => expect(x).toBe('2'))
    .do(() => {
      const m = ctr.as('prom', 'success')
      expect(m.value).toBe('2')
      expect(m.doneAt - m.firedAt).toBeGreaterThanOrEqual(0)
      expect(Date.now() - m.doneAt)
        .toBeLessThanOrEqual(2)
    })
    .toPromise())

test('actions - error', () =>
  ctr.fire('never')()
    .toPromise()
    .catch(err => expect(err.name).toBe('TimeoutError'))
)

test('actions - warn - pull', () =>
  ctr.fire('never')()
    .merge(
      $.timer(5)
        .do(() => expect(Date.now() - ctr.as('never', 'in-progress').warnedAt!)
          .toBeLessThanOrEqual(3))
    )
    .toPromise()
    .catch(err => {
      expect(err.name).toBe('TimeoutError')
    })
)

test('actions - cancel', () =>
  ctr.fire('never')()
    .merge(
      $.timer(5)
        .do(() => ctr.reset('never'))
        .ignoreElements()
    )
    .defaultIfEmpty('EMPTY')
    .toPromise()
    .then(v => expect(v).toBe('EMPTY'))
)

test('actions - double fire throws by default', () =>
  ctr.fire('obs')('abc')
    .merge(ctr.fire('obs')('def'))
    .toPromise()
    .catch(err => expect(err).toBeInstanceOf(RxifireError))
)

test('actions - simple fire', () =>
  ctr.fire('prom')(2)
    .do(x => expect(x).toBe('2'))
    .do(() => {
      const m = ctr.as('prom', 'success')
      expect(m.value).toBe('2')
      expect(m.doneAt - m.firedAt).toBeGreaterThanOrEqual(0)
      expect(Date.now() - m.doneAt)
        .toBeLessThanOrEqual(2)
    })
    .toPromise())

test('actions - ignore', () =>
  ctr.fire('prom')(2)
    .zip(ctr.fire('prom')(2).defaultIfEmpty('EMPTY'))
    .do(([n, e]) => {
      expect(n).toBe('2')
      expect(e).toBe('EMPTY')
    })
    .toPromise()
)

// test('actions - join', () =>
//   ctr.fire('obs2')('abc')
//     .zip(ctr.fire('obs2')('abc'))
//     .do(([a1, a2]) => expect(a1).toEqual(a2))
//     .toPromise()
// )

test('actions - stop-then-refire', () =>
  ctr.fire('obs3')('abc')
    .defaultIfEmpty('EMPTY')
    .zip(ctr.fire('obs3')('abc'))
    .do(([a1, a2]) => {
      expect(a1).toBe('EMPTY')
      expect(a2).toEqual(['a', 'b', 'c'])
    })
    .toPromise()
)

test('actions - reset', () => {
  ctr = new ActionsF$(acts, spec, () => Date.now())
  expect(ctr.meta('obs').status === 'idle').toBe(true)
  ctr.fire('obs')('').toPromise()
  expect(ctr.meta('obs').status === 'in-progress').toBe(true)
  ctr.reset()
  const m = ctr.meta('obs')
  const ks = Object.keys(m)
    .filter(k => (m as any)[k] !== undefined)
  expect(ks.length).toBe(1)
  expect(ks[0]).toBe('status')
  expect(ctr.meta('obs').status === 'idle').toBe(true)
})

test('actions - updates', () =>
  ctr.$('ups')('updates')
    .take(3)
    .toArray()
    .do(rs => expect(rs.map(r => r.update)).toEqual([0, 1, 2]))
    .merge(ctr.fire('ups')(['abcdefghij', 1]))
    .toPromise()
)
