import * as P from './types.priv'

export type OnErrorDirective = 'retry' | 'swallow' | 'rethrow'
export type Status = 'idle' | 'in-progress' | 'completed' | 'error'

export type Actions<T extends ActionsSpec> = {
  [K in keyof T]: P.Action<T[K]>
}

export type ActionsSpec = {
  [K: string]: P.ActionSpec
}
