import { Observable } from 'rxjs/Observable'

type ActionSpec<Params = any, Result = any, Errors = any, Update = any> =
  [Params, Result, Errors, Update]

type Simple<Params, Result> = (p: Params) => (Promise<Result> | Observable<Result>)

type SimpleObs<Params, Result> = (p: Params) => Observable<Result>

type Action<T extends ActionSpec> =
  T[3] extends null ?
  (Simple<T[0], T[1]>) :
  { action: Simple<T[0], T[1]>, updates: Observable<T[3]> } |
  ((p: T[0]) => Observable<{ update: T[3] } | { result: T[1] }>)

type ActionIn<T extends ActionSpec> = T[3] extends null ?
  (SimpleObs<T[0], T[1]>) :
  { action: SimpleObs<T[0], T[1]>, updates: Observable<T[3]> } |
  ((p: T[0]) => Observable<{ update: T[3] } | { result: T[1] }>)

export type Actions<T extends ActionsSpec> = {
  [K in keyof T]: Action<T[K]>
}

// todo: hide export
export type ActionsIn<T extends ActionsSpec> = {
  [K in keyof T]: ActionIn<T[K]>
}

export type ActionsSpec = {
  [K: string]: ActionSpec
}

export class ActionsF$<T extends ActionsSpec> {
  private _acts: ActionsIn<T>

  constructor (act: Actions<T>) {
    this._acts = act as any
  }
}
