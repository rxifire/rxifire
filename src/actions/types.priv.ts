import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'

import { AsActionsIO, ActionsSpec, Status } from './types'
import { DateMs } from '../'

export type ActionIO<Params = any, Result = any, Update = any> =
  [Params, Result, Update]

export type Simple<Params, Result> = (p: Params) => (Promise<Result> | Observable<Result>)

export type SimpleObs<Params, Result> = (p: Params) => Observable<Result>

// this is not 100% ideal as forces as shape of the stream
export type WithUpdatesFn<P, R, U> =
  ((p: P) => Observable<{ update: U } | { result: R }>)
// todo: if needed - priority low
// | ((p: P, onUpdate: (update: U) => void) => Observable<R>)
// |{ action: Simple<T[0], T[1]>, updates: Observable<T[3]> }

export type WithUpdates<R, U> = ReturnType<WithUpdatesFn<any, R, U>>

export type Active<R, U> = Observable<R> | WithUpdates<R, U>

export type ActionFn<T extends ActionIO> =
  T[2] extends null ?
  (Simple<T[0], T[1]>) : WithUpdatesFn<T[0], T[1], T[2]>

export type ActionFnIn<T extends ActionIO> =
  T[2] extends null ?
  (SimpleObs<T[0], T[1]>) : WithUpdatesFn<T[0], T[1], T[2]>

export type ActionsIn<T extends AsActionsIO<any>> = {
  [K in keyof T]: ActionFnIn<T[K]>
}

export type Fire<A extends AsActionsIO<any>, K extends keyof A> =
  A[K][0] extends (never | null | undefined) ?
  (A[K][2] extends (never | null | undefined) ?
    () => Observable<A[K][1]> : () => WithUpdates<A[K][1], A[K][2]>)
  : (A[K][2] extends (never | null | undefined) ?
    (ps: A[K][0]) => Observable<A[K][1]> : (ps: A[K][0]) => WithUpdates<A[K][1], A[K][2]>)

export interface Fired {
  status: 'success' | 'error' | 'in-progress'
  firedAt: DateMs
}

export interface Done {
  status: 'success' | 'error'
  doneAt: DateMs
}

export interface InProgress<Res, Upd> extends Fired {
  status: 'in-progress'
  updates: Upd[]
  cache?: Cache<Res>
  warnedAt?: DateMs
}

export interface Success<Res> extends Fired, Done {
  status: 'success',
  value: Res
}

export interface Error extends Fired, Done {
  status: 'error',
  error: any
}

export type StatusToState<S extends Status, Res, Upd> =
  S extends 'in-progress' ? InProgress<Res, Upd> :
  S extends 'success' ? Success<Res> :
  S extends 'error' ? Error
  : never // 'idle'

export interface Cache<Res> { value: Res, set: DateMs, expired?: DateMs }

export interface Meta<Res, Upd> {
  status: Status
  firedAt?: DateMs
  doneAt?: DateMs
  warnedAt?: DateMs
  updates?: Upd[]
  error?: any
  value?: Res
  // cache?: Cache<Res>
  // logs: Subject<any> todo: this or make status
}

export interface MetaIn<Res, Upd> extends Meta<Res, Upd> {
  inProgress?: Observable<Res> | ReturnType<WithUpdatesFn<any, Res, Upd>>
}

export type Internal<A extends AsActionsIO<any>> = {
  [K in keyof A]: [ActionsIn<A>[K], MetaIn<A[1], A[2]>, NonNullable<ActionsSpec<A>[K]>]
}
