import { ActionsIOError } from '../utils'
import * as P from './tasks.priv'

export type Status = 'idle' | 'in-progress' | 'success' | 'error' // todo: consider inactive | interrupted

export type InProgressRefire =
  'not-allowed' // throw - default
  | 'stop-then-refire' // like .switch - previous cancelled and new fired
  // | 'join' // .share - will get the result -- todo: remove or only if params are the same otherwise it does not make much sense
  | 'ignore' // $.empty()

export type StreamType = 'status' | 'updates' | 'warn'

export type StatusEvent<Params, Res> = P.Idle | P.InProgress<Params, any, P.StartToken> | P.Success<Params, Res> | P.Error<Params>

export type AsTasks<T extends AsTasksIO<any>> = {
  [K in keyof T]: P.ActionFn<T[K]>
}

export type TasksSpec<T extends AsTasksIO<any>> = {
  [K in keyof T]?: Partial<P.ActionSpec<T[K]>>
}

type ToError<T extends {}> = {
  [P in keyof T]: T[P] extends P.ActionIO ? 'OK' : T[P]
}

export type AsTasksIO<T extends {} = object, E extends ToError<T> = ToError<T>> = T extends {
  [k: string]: P.ActionIO
} ? T : ActionsIOError<{ [P in keyof T]: T[P] extends P.ActionIO ? '\u2714' : T[P] }>
