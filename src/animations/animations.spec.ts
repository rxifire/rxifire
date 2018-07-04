import 'rxjs-compat'
import { $ } from '../utils/rx-imports'
import { toProgress, toValue, boundedAnimation } from './bounded'

describe('helpers', () => {

  test('toProgress', () => {
    expect(toProgress(0, 10)(5)).toBe(0.5)
    expect(toProgress(-10, 10)(0)).toBe(0.5)
    expect(toProgress(12, 16)(13)).toBe(0.25)
  })

  test('toValue', () => {
    expect(toValue(0, 10, t => t)(0.5)).toBe(5)
    expect(toValue(-10, 10, t => t)(0.5)).toBe(0)
    expect(toValue(12, 16, t => t)(0.25)).toBe(13)
  })

})

describe('bounded', () => {

  test('simple', () =>
    $.of(0, 30)
      .let(boundedAnimation({
        min: 0, max: 100, duration: 120, easing: t => t
      }))
      .filter(x => x === 30)
      .take(1)
      .toPromise()
  )

  test('simple', () =>
    $.of(0, 100).merge($.timer(240).mapTo(75))
      .let(boundedAnimation({
        min: 0, max: 100, duration: 220, easing: t => t
      }))
      .do(x => console.log('X', x))
      .filter(x => x === 0 || x === 100 || x === 75)
      .take(3)
      .toArray()
      .do(xs => expect(xs).toEqual([0, 100, 75]))
      .toPromise()
  )

})
