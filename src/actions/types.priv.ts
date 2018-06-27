import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { AsActionsIO, ActionsSpec, Status, StreamType, StatusEvent, InProgressRefire } from './types'
import { DateMs, Milliseconds } from '../'
import { InternalError } from '../utils'

type Void = void | null | undefined | never
type AsUniqueToken<T extends string> = { __RXIFIRE__: T }
export type NoOp = AsUniqueToken<'noop'>
export type StartToken = AsUniqueToken<'start'>
export type WarnToken = AsUniqueToken<'warn'>

export type ActionIO<Params = any, Result = any, Update = any> =
  [Params, Result, Update]

export type Simple<Params, Result> = (p: Params) => (Promise<Result> | Observable<Result>)

export type SimpleObs<Params, Result> = (p: Params) => Observable<Result>

// this is not 100% ideal as forces as shape of the stream
export type WithUpdatesFn<P, R, U> =
  P extends Void ?
  ((onUpdate: (u: U) => void) => Observable<R>) :
  ((p: P, onUpdate: (u: U) => void) => Observable<R>)
// todo: if needed - priority low
// | ((p: P, onUpdate: (update: U) => void) => Observable<R>)
// |{ action: Simple<T[0], T[1]>, updates: Observable<T[3]> }

export type WithUpdates<R, U> = ReturnType<WithUpdatesFn<any, R, U>>

export type Active<R, U> = Observable<R> | WithUpdates<R, U>

export type ActionFn<T extends ActionIO> =
  T[2] extends Void ?
  (Simple<T[0], T[1]>) : WithUpdatesFn<T[0], T[1], T[2]>

export type ActionFnIn<T extends ActionIO> =
  T[2] extends Void ?
  (SimpleObs<T[0], T[1]>) : WithUpdatesFn<T[0], T[1], T[2]>

export type ActionsIn<T extends AsActionsIO<any>> = {
  [K in keyof T]: ActionFnIn<T[K]>
}

export type Fire<A extends AsActionsIO<any>, K extends keyof A> =
  A[K][0] extends Void ?
  (A[K][2] extends Void ?
    () => Observable<A[K][1]> : () => WithUpdates<A[K][1], A[K][2]>)
  : (A[K][2] extends Void ?
    (ps: A[K][0]) => Observable<A[K][1]> : (ps: A[K][0]) => WithUpdates<A[K][1], A[K][2]>)

export type ActionSpec<T extends ActionIO> = {
  warnAfter: Milliseconds // action takes longer than expected
  timeout: Milliseconds  // .timeout(ms)
  inProgressRefire: InProgressRefire

  // todo - consider
  // cacheFor: Milliseconds // caches successful result for that long - todo: priority medium - requires key
  // persistentCache?: boolean // false - would require passing persistence mechanism
  // stats?: boolean // keep them automatically
  // history?: boolean | number // no history for now
  // onlyThisInProgress?: boolean // block all others, rather tricky to get right all cases
}

// IMPORTANT: defines internals of implementation
export type Internal<A extends AsActionsIO<any>> = {
  [K in keyof A]: [ActionsIn<A>[K], Meta<A[0], A[1], A[2]>, MetaIn<A[0], A[1], A[2]>, NonNullable<ActionsSpec<A>[K]>]
}

// todo: add fire config - priority low
export interface Fired<Params> {
  status: 'success' | 'error' | 'in-progress'
  firedAt: DateMs
  firedParams: Params
}

export interface Done {
  status: 'success' | 'error'
  doneAt: DateMs
}

export interface Idle {
  status: 'idle'
}

export type InProgress<Params, Upd, Type> = Fired<Params> & {
  status: 'in-progress'
} & (Type extends StartToken ? {} :
  (Type extends WarnToken ? { warnedAt: DateMs } : { warnedAt?: DateMs }) &
  (Upd extends (Void) ? {} : { update: Upd, updatedAt: DateMs })
  )

export interface Success<Params, Res> extends Fired<Params>, Done {
  status: 'success',
  value: Res
}

export interface Error<Params> extends Fired<Params>, Done {
  status: 'error',
  error: any
}

export type StatusToState<S extends Status, Params, Res, Upd> =
  S extends 'in-progress' ? Readonly<InProgress<Params, Upd, NoOp>> :
  S extends 'success' ? Readonly<Success<Params, Res>> :
  S extends 'error' ? Readonly<Error<Params>>
  : Readonly<Idle>

export type StreamToUpdates<S extends StreamType, Params, Res, Upd> =
  S extends 'status' ? Observable<StatusEvent<Params, Res>> :
  S extends 'warn' ? Observable<InProgress<Params, Upd, WarnToken>> :
  S extends 'updates' ? Observable<InProgress<Params, Upd, NoOp>> :
  InternalError

export type AvailableStreams<Upd> = Upd extends Void ? 'status' | 'warn' : StreamType

export interface Cache<Res> { value: Res, set: DateMs, expired?: DateMs }

export interface Meta<Params, Res, Upd> {
  status: Status
  fireWith?: Params,
  firedAt?: DateMs
  doneAt?: DateMs
  warnedAt?: DateMs
  update?: Upd
  updatedAt?: DateMs
  error?: any
  value?: Res
}

export interface MetaIn<Params, Res, Upd> {
  _inProgress?: Observable<Res> | ReturnType<WithUpdatesFn<any, Res, Upd>>
  _status: Subject<Status>
  _updates: Subject<InProgress<Params, Upd, NoOp>>
  _warn: Subject<InProgress<Params, Upd, WarnToken>>
}
