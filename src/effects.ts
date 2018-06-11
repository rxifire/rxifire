import { Observable } from 'rxjs/Observable'

// todo: add progress update
export type Effect<P, R> = (params: P) => (Promise<R> | Observable<R>)

export type EffectBase = Effect<any, any>

// ideally we could infer params from the function itself
// seems to be impossible currently, but maybe ?
export type EffectsContract = {
  [k: string]: [any, any, any] // ParamsIn, Out, Error
}

export type Effects<T extends EffectsContract> = {
  [k in keyof EffectsContract]: Effect<EffectsContract[k][0], EffectsContract[k][1]>
}

export type Errors<T extends EffectsContract> = {
  [k in keyof EffectsContract]: EffectsContract[k][2]
}

// todo: figure out if parallel fires makes much sense
// exhaust ignores fires if one in-progress
export type Mode = 'exhaust' | 'switch' // | 'merge'

export interface FireInfo<P, R> {
  params: P
  result?: R

  firedAt: Date // todo: investigate how to make it working with Schedulers
  successAt?: Date
  errorAt?: Date

  counter: number // how many times was already fired
  duration?: number
}

export type Config<Effs extends EffectsContract> = {
  [k in keyof Effs]: {
    mode?: Mode
    name?: string
    // timeoutMs?: number // never
    // autoClearErrorMs?: number // Infinity
    // canFireWithError?: boolean

    // keepHistory?: boolean
  }
}

export type Status = 'active' | 'inactive' | 'in-progress' | 'error'

export interface Info<P, R> {
  status: Status
  canFire: boolean // true if active or error (or in-progress in case of `switch`)

  isActive: boolean
  isInactive: boolean
  isInProgress: boolean
  hasError: boolean

  inProgressInfo?: FireInfo<P, R> // most-recently fired in case of `merge`
  // inProgressInfos: FireInfo[] // todo: when `merge` - ideally use conditional types

  history?: FireInfo<P, R>[] // entities mutable
  // errorCount?: number
}

export interface EffectControl<P, R> {
  fire: Effect<P, R> // fires always on a next tick

  activate (): void
  inactivate (): void // stops in progress
  clearError (): void
  clearHistory (): void
}
