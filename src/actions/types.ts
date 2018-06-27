import { TypeError } from '../'
import * as P from './types.priv'

export type Status = 'idle' | 'in-progress' | 'success' | 'error' // todo: consider inactive | interrupted

export type InProgressRefire =
  'not-allowed' // throw - default
  | 'stop-then-refire' // like .switch - previous cancelled and new fired
  // | 'join' // .share - will get the result -- todo: remove or only if params are the same otherwise it does not make much sense
  | 'ignore' // $.empty()

export type StreamType = 'status' | 'updates' | 'warn'

export type StatusEvent<Res> = P.Idle | P.InProgress<P.SecretMarker> | P.Success<Res> | Error

export type Actions<T extends AsActionsIO<any>> = {
  [K in keyof T]: P.ActionFn<T[K]>
}

export type ActionsSpec<T extends AsActionsIO<any>> = {
  [K in keyof T]?: Partial<P.ActionSpec<T[K]>>
}

export type AsActionsIO<T extends {}> = T extends {
  [k: string]: P.ActionIO
} ? T : TypeError<'ActionsIO must be of form [Params, Result, Update | null]. [todo more info]'>
