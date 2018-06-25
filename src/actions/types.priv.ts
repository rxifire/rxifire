import { Observable } from 'rxjs/Observable'

import { ActionsIO } from './types'

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

export type ActionsIn<T extends ActionsIO> = {
  [K in keyof T]: ActionIn<T[K]>
}
