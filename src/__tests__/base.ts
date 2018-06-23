import 'rxjs-compat'
import { Observable as $ } from 'rxjs/Observable'

import { _throw, ErrorCode, RxifireError } from '../errors'
import { SignalWrap, BehaviorsWrap } from '../streams'

test('_throw', () => {
  expect(() => _throw(ErrorCode.SIGNAL_TO_VOID)).toThrowError(RxifireError)
})

interface Signals {
  a: number,
  b: string,
  c: { a: number, b: string },
  d: null
}

test('signal - basic', () => {
  const s = new SignalWrap<Signals>()
  const { a, b, c, d } = s.$s(['a', 'b', 'c', 'd'])
  return $.merge(
    a.do(r => expect(r).toBe(1)),
    b.do(r => expect(r).toBe('b')),
    c.do(r => expect(r.a).toBe(2)),
    d.do(r => expect(r).toBe(undefined)),
    $.of(false)
      .do(() => {
        s.fire('a')(1)
        s.fire('b')('b')
        s.fire('c')({ a: 2, b: 'B' })
        s.fire('d')()
      })
      .ignoreElements()
  )
    .take(4)
    .toPromise()
})

// handful in case of event.target.value to signal
test('signal - map cb value to proper type and fire', () => {
  const s = new SignalWrap<Signals>()
  const a = s.$('a')
  const c = s.$('c')
  const cbObj: (cb: (p: { n: number }) => void) => void = (cb) => cb({ n: 42 })
  const cbObj2: (cb: (p: string) => void) => void = (cb) => cb('42')
  return $.merge(
    a.take(2).do(x => expect(x).toBe(42)),
    c.take(1).do(x => expect(x.a).toBe(43)).do(x => expect(x.b).toBe('B')),
    $.of(true)
      .do(() => cbObj(s.fire('a', (x: { n: number }) => x.n)))
      .do(() => cbObj2(s.fire('a', (x: string) => parseInt(x, 10))))
      .do(() => cbObj2(s.fire('c', (x: string) => ({ a: parseInt(x, 10) + 1, b: 'B' }))))
      .ignoreElements()
  )
    .toPromise()
})
