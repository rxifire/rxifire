import {
  $, Observable, defer, map, skip, switchMap, mergeMap, empty,
  repeatWhen, animationFrame, observeOn, distinctUntilChanged, merge, tap, take
} from './rx-imports'

const linearProgress = (start: number, end: number) => (progress: number) => start + ((end - start) * progress)

export const linearAnimation = (duration: number) => (valuesStream: Observable<number>) => {
  let current: number // remember last value to allow smooth continuation

  const rest = valuesStream
    .pipe(
      skip(1),
      map(nextValue => ({
        nextValue,
        startValue: current,
        startTime: Date.now()
      })),
      switchMap(({ nextValue, startValue, startTime }) =>
        nextValue - startValue <= 1 ? Observable.of(nextValue) :
          defer(() => Observable.of(Date.now()))
            .pipe(
              observeOn(animationFrame),
              map(now => (now - startTime) / duration),
              map(linearProgress(startValue, nextValue)),
              map(v => Math.min(Math.ceil(v), nextValue)),
              repeatWhen(changes => changes.pipe(
                mergeMap(() =>
                  current < nextValue ? $.of(true) : empty()
                ))),
              distinctUntilChanged()
            )
      )
    )

  return merge(
    valuesStream.pipe(take(1)),
    rest).pipe(tap(value => (current = value)))
}
