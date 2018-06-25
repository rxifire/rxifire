import * as P from './types.priv'
import { Milliseconds } from '../'

export type Status = 'idle' | 'in-progress' | 'success' | 'error' // todo: consider inactive | interrupted

export type InProgressRefire =
  'not-allowed' // throw - default
  | 'stop-then-refire' // like .switch - previous cancelled and new fired
  | 'join' // .share - will get the result -- todo: remove or only if params are the same otherwise it does not make much sense
  | 'ignore' // $.empty()

export type Actions<T extends AsActionsIO<any>> = {
  [K in keyof T]: P.Action<T[K]>
}

type ActionSpec<T extends P.ActionIO> = {
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

export type ActionsSpec<T extends AsActionsIO<any>> = {
  [K in keyof T]?: Partial<ActionSpec<T[K]>>
}

export type AsActionsIO<T extends {}> = T extends {
  [k: string]: P.ActionIO
} ? T : { F$_TYPE_ERROR: 'ActionsIO must be of form [Params, Result, Update | null]. [todo more info]' }
