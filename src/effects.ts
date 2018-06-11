import { Observable } from 'rxjs/Observable'

// todo: add progress update
export type Effect<P, R> = (params: P) => Observable<R>

export type EffectBase = Effect<any, any>

// ideally we could infer params from the function itself
// seems to be impossible currently, but maybe ?
export type EffectsContract = {
  [k: string]: [any, any, any] // ParamsIn, Out, Error
}

export type Effects<T extends EffectsContract> = {
  [k in keyof T]: Effect<T[k][0], T[k][1]>
}

// export type Errors<T extends EffectsContract> = {
//   [k in keyof T]: T[k][2]
// }

// todo: figure out if parallel fires makes much sense
// exhaust ignores fires if one in-progress
export type Mode = 'exhaust' | 'switch' // | 'merge'

export type Infos<T extends EffectsContract> = {
  [k in keyof T]: Info<T[k][0], T[k][1], T[k][2]>
}

export type Controls<T extends EffectsContract> = {
  [k in keyof T]: Control
}

export interface FireInfo<P, R, E> {
  params: P
  result?: R
  error?: E

  firedAt: Date // todo: investigate how to make it working with Rx-Schedulers
  successAt?: Date
  errorAt?: Date

  counter: number // how many times was already fired
  // duration?: number
}

export type Config<Effs extends EffectsContract> = {
  [k in keyof Effs]: {
    mode?: Mode
    name?: string
    initialStatus: 'active' | 'inactive'
    // timeoutMs?: number // never
    // autoClearErrorMs?: number // Infinity
    // canFireWithError?: boolean

    // keepHistory?: boolean
  }
}

export type Status = 'active' | 'inactive' | 'in-progress' | 'error'

export interface Info<P, R, E> {
  status: Status
  canFire: boolean // true if active or error (or in-progress in case of `switch`)

  isActive: boolean
  isInactive: boolean
  isInProgress: boolean

  inProgressInfo?: FireInfo<P, R, E> // most-recently fired in case of `merge`
  // inProgressInfos: FireInfo[] // todo: when `merge` - ideally use conditional types

  error?: E
  history?: FireInfo<P, R, E>[] // entities mutable
  // errorCount?: number
}

export interface Control {
  activate (): void
  desactivate (): void // stops in progress
  clearError (): void
  clearHistory (): void
}
