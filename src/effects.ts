import { Observable } from 'rxjs/Observable'

export type Effect<P, R> = (params: P) => (Promise<R> | Observable<R>) // todo: add progress update

export type Eff = Effect<any, any>

export type Effects = {
  [k: string]: Effect<any, any>
}

// exhaust ignores fires if one in-progress
export type Mode = 'exhaust' | 'switch' | 'merge'

export interface Stats {
  firedAt: Date // todo: investigate how to make it working with Schedulers
  params: any
 
  successAt?: Date
  errorAt?: Date
  result?: any
  
  duration?: number
}

export type Config<Effs extends Effects> = {
  [k in keyof Effs]: {
    mode?: Mode
    timeoutMs?: number // never
    autoClearErrorMs?: number // Infinity
    canFireWithError?: boolean
    keepHistory?: boolean
  }
}

export type Status = 'active' | 'inactive' | 'in-progress' | 'error'

export interface Info<E extends Effect<any, any>> {
  status: Status[]
  canFire: boolean 
  
  isActive: boolean
  isInactive: boolean
  isInProgress: boolean
  hasError: boolean

  stats?: Stats // most-recently fired in case of `merge`
  inProgressStats: Stats[]

  // requires keep history
  history?: Stats[]
  errorCount?: number
}

export interface EffectControl<P, R> {
  fire: Effect<P, R>
  unfire: () => void // todo

  clearError: () => void
  clearHistory: () => void
}
