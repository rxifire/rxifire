import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'

import { AsActionsIO, ActionsSpec, Status } from './types'
import { DateMs } from '../'

export type ActionIO<Params = any, Result = any, Update = any> =
  [Params, Result, Update]

export type Simple<Params, Result> = (p: Params) => (Promise<Result> | Observable<Result>)

export type SimpleObs<Params, Result> = (p: Params) => Observable<Result>

export type Action<T extends ActionIO> =
  T[2] extends null ?
  (Simple<T[0], T[1]>) :
  // todo: if needed - priority low { action: Simple<T[0], T[1]>, updates: Observable<T[3]> } |
  ((p: T[0]) => Observable<{ update: T[2] } | { result: T[1] }>)

export type ActionIn<T extends ActionIO> =
  T[2] extends null ?
  (SimpleObs<T[0], T[1]>) :
  // todo: if needed { action: SimpleObs<T[0], T[1]>, updates: Observable<T[3]> } |
  ((p: T[0]) => Observable<{ update: T[2] } | { result: T[1] }>)

export type ActionsIn<T extends AsActionsIO<any>> = {
  [K in keyof T]: ActionIn<T[K]>
}

// type WithTime<Res> = Array<{ at: Milliseconds, value: Res }>

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
}

export interface Success<Res> extends Fired, Done {
  status: 'success',
  result: Res
  // result: Multi extends false ? Res : WithTime<Res>
}
// type InProgressMulti = never // todo

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
  [k: string]: any
  status: Status
  firedAt?: DateMs
  doneAt?: DateMs
  updates?: Upd[]
  error?: any
  value?: Res
  // cache?: Cache<Res>
  // logs: Subject<any> todo: this or make status
}

export interface MetaIn<Res, Upd> extends Meta<Res, Upd> {
  [k: string]: any

  inProgress?: Observable<Res>
  // until: Subject<any>
  // sub?: Subscription
}

export type Internal<A extends AsActionsIO<any>> = {
  [K in keyof A]: [ActionsIn<A>[K], MetaIn<A[1], A[2]>, ActionsSpec<A>[K]]
}
