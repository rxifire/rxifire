import { Observable } from 'rxjs/Observable'

// todo: incorporate Error type
export type Effect<P, R> = (params: P) => (Promise<R> | Observable<R>) // todo: add progress update

export type Eff = Effect<any, any>

export type Effects = {
  [k: string]: Effect<any, any>
}

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

export type Config<Effs extends Effects> = {
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

  // requires keep history
  // history?: FireInfo[]
  // errorCount?: number
}

export interface EffectControl<P, R> {
  fire: (params: P) => Observable<R>

  activate (): void
  inactivate (): void // stops in progress
  clearError (): void

  // clearHistory: () => void
}
