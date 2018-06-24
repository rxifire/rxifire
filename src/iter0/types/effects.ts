import { Observable } from 'rxjs/Observable'

// todo: add progress update
// Promise will be upgraded to Observable
export type Effect<P, R> = (params: P) => (Observable<R> | Promise<R>)

export type EffectBase = Effect<any, any>

// ideally we could infer params from the function itself
// seems to be impossible currently, but maybe?
export type EffectsContract = {
  [k: string]: [any, any, any] // ParamsIn, Out, Error
}

export type Effects<T extends EffectsContract> = {
  [k in keyof T]: Effect<T[k][0], T[k][1]>
}

export type EffectsObs<T extends EffectsContract> = {
  [k in keyof T]: (p: T[k][0]) => Observable<T[k][1]>
}

export type EffectsIn<T extends EffectsContract> = {
  [k in keyof T]: T[k][0]
}

export type EffectsLogic<T extends EffectsContract> = {
  f: EffectsObs<T>, fire: EffectsObs<T>,
  i: EffectsInfos<T>, info: EffectsInfos<T>
}

export type EffectsView<T extends EffectsContract> = EffectsInfos<T>

export type EffectsInfos<T extends EffectsContract> = {
  [k in keyof T]: EffInfoI<T[k][1], T[k][2]>
}

export type EffStatus = 'active' | 'in-progress' | 'success' | 'error'

export interface EffInfoI<R, E> {
  status: EffStatus
  result?: R // in-case of success
  error?: E // in-case of error

  is: (s: EffStatus) => boolean

  reset (): void
}