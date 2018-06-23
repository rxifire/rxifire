import 'rxjs-compat'
import { Observable as $ } from 'rxjs/Observable'

import { _throw, ErrorCode, RxifireError } from '../errors'
import { SignalsFire, BehaviorsFire } from '../streams'

test('errors - _throw', () => {
  expect(() => _throw(ErrorCode.SIGNAL_TO_VOID)).toThrowError(RxifireError)
})

test('errors - JSON', () => {
  const err1 = JSON.parse(new RxifireError(ErrorCode.SIGNAL_TO_VOID).toJSON())
  const err2 = JSON.parse(new RxifireError(ErrorCode.SIGNAL_TO_VOID).toJSON(true))
  expect(err1.status).toBe(ErrorCode.SIGNAL_TO_VOID)
  expect(err2.status).toBe(ErrorCode.SIGNAL_TO_VOID)
})

interface Behaviors {
  a: number,
  b: string,
  c: { a: number, b: string },
}

interface Signals extends Behaviors {
  d: null
}

const start: Behaviors = {
  a: 1, b: 'B', c: { a: 2, b: 'B' }
}

test('signal - basic', () => {
  const sg = new SignalsFire<Signals>()
  const { a, b, c, d } = sg.$s(['a', 'b', 'c', 'd'])
  return $.merge(
    a.do(r => expect(r).toBe(1)),
    b.do(r => expect(r).toBe('b')),
    c.do(r => expect(r.a).toBe(2)),
    d.do(r => expect(r).toBe(undefined)),
    $.of(false)
      .do(() => {
        sg.fire('a')(1)
        sg.fire('b')('b')
        sg.fire('c')({ a: 2, b: 'B' })
        sg.fire('d')()
      })
      .ignoreElements()
  )
    .take(4)
    .toPromise()
})

// handful in case of event.target.value to signal
test('signal - map cb value to proper type and fire', () => {
  const sg = new SignalsFire<Signals>()
  const a = sg.$('a')
  const c = sg.$('c')
  const cbObj: (cb: (p: { n: number }) => void) => void = (cb) => cb({ n: 42 })
  const cbObj2: (cb: (p: string) => void) => void = (cb) => cb('42')
  return $.merge(
    a.take(2).do(x => expect(x).toBe(42)),
    c.take(1).do(x => expect(x.a).toBe(43)).do(x => expect(x.b).toBe('B')),
    $.of(true)
      .do(() => cbObj(sg.fire('a', (x: { n: number }) => x.n)))
      .do(() => cbObj2(sg.fire('a', (x: string) => parseInt(x, 10))))
      .do(() => cbObj2(sg.fire('c', (x: string) => ({ a: parseInt(x, 10) + 1, b: 'B' }))))
      .ignoreElements()
  )
    .toPromise()
})

test('signal - throws when fire cb accessed before stream', () =>
  expect(() => new SignalsFire<Signals>().fire('a')).toThrowError(RxifireError)
)

test('signal - cache', () => {
  const sg = new SignalsFire<Signals>()
  sg.$('a')
  const cb1 = sg.fire('a')
  const cb2 = sg.fire('a')
  expect(cb1).toBe(cb2)
  const m = (x: string) => parseInt(x, 10)
  const m2 = m
  const m3 = (x: string) => parseInt(x, 10)
  expect(sg.fire('a', m)).toBe(sg.fire('a', m))
  expect(sg.fire('a', m)).toBe(sg.fire('a', m2)) // name set when `m` declared

  expect(sg.fire('a', () => 1)).toBe(sg.fire('a', () => 1)) // same body no names
  expect(sg.fire('a', m)).not.toBe(sg.fire('a', m3)) // same body but different name
})

test('behaviors - basic', () => {
  const bh = new BehaviorsFire<Behaviors>(start)
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
  const bh = new BehaviorsFire<Behaviors>(start)
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
