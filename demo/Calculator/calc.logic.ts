import * as Rx from 'rxjs'

import { Logic, UIState, Digit, Operation, UIStateIn } from './calc.types'

const $ = Rx.Observable

const opHandlers: {
  [k in Operation]: ((l: number, r: number) => number)
} = {
  '+': (l, r) => l + r,
  '-': (l, r) => l - r,
  '*': (l, r) => l * r,
  '/': (l, r) => (l / r)
}

const formNumber = (digit: Rx.Observable<Digit>, dot: Rx.Observable<any>, until: Rx.Observable<any>):
  Rx.Observable<string> =>
  digit.map(d => `${d}`)
    .merge(dot.take(1).mapTo('.'))
    .scan((acc, n) => n === '0' && (acc[0] === n) ? acc : acc.concat(n), [])
    .map(c => c.join(''))
    .takeUntil(digit.take(1)
      .switchMapTo(until))
    .defaultIfEmpty('0')

export const logic: Logic = ({ uiEvents }) =>
  $.concat(
    formNumber(uiEvents.digit, uiEvents.dot, uiEvents.operation)
      .map(n => ({ left: n })),
    formNumber(uiEvents.digit, uiEvents.dot, uiEvents.equal)
      .map(n => ({ right: n }))
  )
    .merge(uiEvents.digit.take(1).switchMapTo(uiEvents.operation)
      .take(1).map(o => ({ operation: o })))
    .scan((acc, n) => Object.assign({}, acc, n), {} as UIStateIn)
    .switchMap(r => uiEvents.equal
      .filter(() => 'right' in r)
      .take(1)
      .map(() => opHandlers[r.operation!](parseFloat(r.left!), parseFloat(r.right!)))
      .map(r => ({ result: r.toString() }))
      .startWith(r as UIState))
    .do(x => console.log('STATE', x))
    .startWith({})
    .finally(() => console.log('DONE'))
