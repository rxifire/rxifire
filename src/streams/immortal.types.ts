import { DateMs, Milliseconds, InternalError } from '../utils'
import { Observable } from 'rxjs/Observable'

export type ImmStatus = 'loading' | 'active' | 'completed' | 'error'
type LoadedStatus = Exclude<ImmStatus, 'loading'>
type DoneStatus = Exclude<LoadedStatus, 'active'>

type StateBase<Status extends ImmStatus> = {
  status: Status
  started: DateMs // last run
  longLoad?: DateMs
}

type Loaded<Status extends LoadedStatus> = StateBase<Status> & { loaded: DateMs }
type Done<Status extends DoneStatus> = StateBase<Status> & { reload: () => void }

export type ImmLoading = StateBase<'loading'> & {}
export type ImmActive = Loaded<'active'> & {}
export type ImmCompleted = Done<'completed'> & { completed: DateMs }
export type ImmError = Done<'error'> & { errorAt: DateMs, error: any }

export type StatusToImmortal<S extends ImmStatus> =
  S extends 'loading' ? ImmLoading :
  S extends 'active' ? ImmActive :
  S extends 'completed' ? ImmCompleted :
  S extends 'error' ? ImmError :
  InternalError

export type Immortal = ImmLoading | ImmActive | ImmCompleted | ImmError

export type ImmortalSpec = {
  longLoad?: Milliseconds
  shareable?: boolean
  onError?: (e: any) => boolean // known
}
