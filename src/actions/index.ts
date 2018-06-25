
import * as P from './types.priv'
import * as T from './types'

export * from './types'

export class ActionsF$<T extends T.ActionsSpec> {
  private _acts: P.ActionsIn<T>

  constructor (act: T.Actions<T>) {
    this._acts = act as any
  }
}
