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
    a, b, c, d,
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
    .toArray()
    .toPromise()
})

// handful in case of event.target.value to signal
test('signal - map cb value to proper type and fire', () => {
  const s = new SignalWrap<Signals>()
  const a = s.$('a')
  const cbObj: (cb: (p: { n: number }) => void) => void = (cb) => {
    cb({ n: 42 })
  }
  const cbObj2: (cb: (p: string) => void) => void = (cb) => {
    cb('42')
  }
  return $.merge(
    a,
    $.of(true)
      .do(() => cbObj(s.fire('a', (x: { n: number }) => x.n)))
      .do(() => cbObj2(s.fire('a', (x: string) => parseInt(x, 10))))
      .ignoreElements()
  )
    .take(2)
    .do(x => expect(x).toBe(42))
    .toPromise()
})
