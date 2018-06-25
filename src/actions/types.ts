import * as P from './types.priv'
import { Milliseconds } from '../'

export type Status = 'idle' | 'in-progress' | 'success' | 'error' // todo: consider inactive | interrupted

type WithTime<Res> = Array<{ at: Milliseconds, value: Res }>

export interface Fired {
  status: Status
  firedAt: Milliseconds
}

export interface Done {
  status: 'success' | 'error'
  doneAt: Milliseconds
}

export interface InProgress<Up> extends Fired {
  status: 'in-progress'
  updates: WithTime<Up>
}

export type InProgressMulti = never // todo

export interface Success<Res, Multi extends boolean = false> extends Fired, Done {
  status: 'success',
  result: Multi extends false ? Res : WithTime<Res>
}

export interface Error<Err> extends Fired, Done {
  status: 'error',
  error: Err
}

export type StatusToState<S extends Status> =
  S extends 'in-progress' ? InProgress<any> :
  S extends 'success' ? Success<any> :
  S extends 'error' ? Error<any>
  : never // 'idle'

export type Actions<T extends ActionsIO> = {
  [K in keyof T]: P.Action<T[K]>
}

export interface ActionsIO {
  [K: string]: P.ActionIO
}

type ActionSpec<T extends P.ActionIO> = {
  warnAfter: Milliseconds // action takes longer than expected
  timeout: Milliseconds  // .timeout(ms)
  cacheFor: Milliseconds // caches successful result for that long

  // todo - consider
  persistentCache?: boolean // false - would require passing persistence mechanism
  stats?: boolean // keep them automatically
  history?: boolean | number // no history for now
}

export type ActionsSpec<T extends ActionsIO> = {
  [K in keyof T]?: Partial<ActionSpec<T[K]>>
}
