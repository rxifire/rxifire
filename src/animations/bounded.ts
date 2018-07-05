import {
  $, Observable, filter, map, skip, switchMap, animationFrame, observeOn, merge, tap, take, takeWhile
} from '../utils/rx-imports'
import { Milliseconds } from '../utils'
import { EasingFn } from './easing'

type Progress = number

export const toValue = (min: number, max: number, easing: EasingFn) =>
  (progress: Progress) => min + ((max - min) * easing(progress))

export const toProgress = (min: number, max: number) => (v: number): Progress =>
  v === min ? 0 :
    v === max ? 1 :
      (v - min) / (max - min)

export type BoundedAnimationConfig = {
  duration: Milliseconds
  min: number
  max: number
  // TODO: right now easing is symmetric, but it should be possible to specify min->max and max->min separately
  easing: EasingFn
}

export const boundedAnimation = (cfg: BoundedAnimationConfig, scheduler = animationFrame) =>
  (valuesStream: Observable<number>) => {
    let progress: Progress // [0..1]
    const toP = toProgress(cfg.min, cfg.max)
    const rest = valuesStream
      .pipe(
        skip(1),
        switchMap((v: Progress) => {
          const to: Progress = toP(v)
          const dir = to > progress ? 1 / cfg.duration : -1 / cfg.duration
          let last = scheduler.now()
          return $.timer(0, 17)
            .pipe(
              observeOn(scheduler),
              takeWhile(() => progress !== to),
              map(() => {
                const now = scheduler.now()
                let p = dir >= 0 ? Math.min(to, progress + dir * (now - last)) :
                  Math.max(to, progress + dir * (now - last))
                last = now
                return p
              })
            )
        })
      )

    return merge(
      valuesStream.pipe(take(1), map(toP)),
      rest)
      .pipe(
        tap(p => progress = p),
        map(toValue(cfg.min, cfg.max, cfg.easing))
      )
  }
