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
  d: never
}

test('signal', () => {
  const s = new SignalWrap<Signals>()
  const { a, b, c, d } = s.$s(['a', 'b', 'c', 'd'])
  return $.merge(
    a, b, c, d,
    $.of(false)
      .do(() => {
        s.emit('a')(1)
        s.emit('b')('b')
        s.emit('c')({ a: 2, b: 'B' })
        s.emit('d')()
      })
      .ignoreElements()
  )
    .take(4)
    .toArray()
    .toPromise()
})
