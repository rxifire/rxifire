import { Observable } from 'rxjs/Observable'

// todo: add progress update
export type Effect<P, R> = (params: P) => (Observable<R> | Promise<R>)

export type EffectBase = Effect<any, any>

// ideally we could infer params from the function itself
// seems to be impossible currently, but maybe ?
export type EffectsContract = {
  [k: string]: [any, any, any] // ParamsIn, Out, Error
}

export type Effects<T extends EffectsContract> = {
  [k in keyof T]: Effect<T[k][0], T[k][1]>
}

export type EffectsIn<T extends EffectsContract> = {
  [k in keyof T]: T[k][0]
}

export type EffInfos<T extends EffectsContract> = {
  [k in keyof T]: EffInfo<T[k][1], T[k][2]>
}

export type EffStatus = 'active' | 'in-progress' | 'success' | 'error'

export interface EffInfo<R, E> {
  status: EffStatus
  result?: R // in-case of success
  error?: E // in-case of error

  is: (s: EffStatus) => boolean

  reset (): void
}
