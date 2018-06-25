import 'rxjs-compat'
import { Observable as $ } from 'rxjs/Observable'

import { ActionsF$, AsActionsIO, ActionsSpec, Actions } from './index'
import { RxifireError } from '../utils/errors'

// todo: this will be modified once variadic params landed in TS
type IO = AsActionsIO<{
  prom: [number, string, null],
  obs: [string, string[], null],
  never: [null, never, null]
}>

const acts: Actions<IO> = {
  prom: (n) => Promise.resolve(`${n}`),
  obs: (s) => $.of(s.split('')).delay(1),
  never: () => $.never()
}

const spec: ActionsSpec<IO> = {
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

test('actions - error', () =>
  ctr.fire('never')()
    .toPromise()
    .catch(err => expect(err.name).toBe('TimeoutError'))
)

test('actions - warn', () =>
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
