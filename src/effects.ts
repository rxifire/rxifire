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

export type EffectsIn<T extends EffectsContract> = {
  [k in keyof T]: T[k][0]
}

export type Infos<T extends EffectsContract> = {
  [k in keyof T]: Info<T[k][1], T[k][2]>
}

export type Status = 'active' | 'inactive' | 'in-progress' | 'success' | 'error'

export interface Info<R, E> {
  status: Status
  result?: R // in-case of success
  error?: E // in-case of error

  is: (s: Status) => boolean

  resetTo (s: 'active' | 'inactive'): void
}

// TODO - review and most likely delete - keep it simple

// export type Controls<T extends EffectsContract> = {
//   [k in keyof T]: Control<any>
// }

// export interface Control<P> {
//   // params: Observable<P>
//   // valid: Observable<boolean>

//   // activate (): void
//   // desactivate (): void // stops in progress

//   // clearError (): void
//   // clearHistory (): void
// }

// export type Errors<T extends EffectsContract> = {
//   [k in keyof T]: T[k][2]
// }

// todo: figure out if parallel fires makes much sense
// exhaust ignores fires if one in-progress
// export type Mode = 'exhaust' | 'switch'

// export interface FireInfo<P, R, E> {
//   params: P
//   result?: R
//   error?: E

//   firedAt: Date // todo: investigate how to make it working with Rx-Schedulers
//   successAt?: Date
//   errorAt?: Date

//   // counter: number // how many times was already fired
//   // duration?: number
// }

// export type Config<Effs extends EffectsContract> = {
//   [k in keyof Effs]: {
//     mode?: Mode
//     name?: string
//     initialStatus: 'active' | 'inactive'
//     // timeoutMs?: number // never
//     // autoClearErrorMs?: number // Infinity
//     // canFireWithError?: boolean

//     // keepHistory?: boolean
//   }
// }
