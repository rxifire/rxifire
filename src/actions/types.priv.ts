import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { AsActionsIO, ActionsSpec, Status, StreamType, StatusEvent, InProgressRefire } from './types'
import { DateMs, Milliseconds, TypeError } from '../'

export type SecretMarker = { __RXIFIRE__: 'RXIFIRE' }

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

export type ActionSpec<T extends ActionIO> = {
  warnAfter: Milliseconds // action takes longer than expected
  timeout: Milliseconds  // .timeout(ms)
  cacheFor: Milliseconds // caches successful result for that long
  inProgressRefire: InProgressRefire

  // todo - consider
  // persistentCache?: boolean // false - would require passing persistence mechanism
  // stats?: boolean // keep them automatically
  // history?: boolean | number // no history for now
  // onlyThisInProgress?: boolean // block all others, rather tricky to get right all cases
}

// IMPORTANT: defines internals of implementation
export type Internal<A extends AsActionsIO<any>> = {
  [K in keyof A]: [ActionsIn<A>[K], Meta<A[1], A[2]>, MetaIn<A[1], A[2]>, NonNullable<ActionsSpec<A>[K]>]
}

export interface Fired {
  status: 'success' | 'error' | 'in-progress'
  firedAt: DateMs
}

export interface Done {
  status: 'success' | 'error'
  doneAt: DateMs
}

export interface Idle {
  type: 'idle'
}

export type InProgress<Upd> = Fired & {
  status: 'in-progress'
} & (Upd extends SecretMarker ? {} : { updates: Upd[], warnedAt?: DateMs })

export interface Success<Res> extends Fired, Done {
  status: 'success',
  value: Res
}

export interface Error extends Fired, Done {
  status: 'error',
  error: any
}

export type StatusToState<S extends Status, Res, Upd> =
  S extends 'in-progress' ? InProgress<Upd> :
  S extends 'success' ? Success<Res> :
  S extends 'error' ? Error
  : never // 'idle'

export type StreamToUpdates<S extends StreamType, Res, Upd, K> =
  S extends 'status' ? Observable<StatusEvent<Res>> :
  S extends 'warn' ? Observable<DateMs> :
  S extends 'updates' ? (Upd extends (never | null | undefined) ?
    TypeError<'No updates defined for this action.', { action: K, updatesType: Upd }>
    : Observable<InProgress<Upd>>) : TypeError<'Internal Error'>

export interface Cache<Res> { value: Res, set: DateMs, expired?: DateMs }

export interface Meta<Res, Upd> {
  status: Status
  firedAt?: DateMs
  doneAt?: DateMs
  warnedAt?: DateMs
  updates?: Upd[]
  error?: any
  value?: Res
}

export interface MetaIn<Res, Upd> {
  _inProgress?: Observable<Res> | ReturnType<WithUpdatesFn<any, Res, Upd>>
  _status: Subject<Status>
  _updates: Subject<InProgress<Upd>>
}
