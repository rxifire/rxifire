import { Observable } from 'rxjs'
import { BehaviorsFire, SignalsFire } from '../utils/sig-beh'

export type Logic<T extends ComponentSpec> = (ps: LogicParams<T, NonNullable<T['__F$__']>[1]>) => Observable<NonNullable<T['__F$__']>[0]>

export type View = (state: any, ps: any) => JSX.Element

export type ComponentSpec<State = {}, Signals extends {} = {}, Behaviors extends {} = {}> = {
  behaviorDefaults?: Behaviors

  __F$__?: [State, Signals]
}

export type LogicParams<T extends ComponentSpec, Sig = undefined> =
  (Sig extends undefined ? {} : { sig: SignalsFire<Sig> }) &
  (T['behaviorDefaults'] extends undefined ? {} : { beh: BehaviorsFire<NonNullable<T['behaviorDefaults']>> })

export type ViewParams<T extends ComponentSpec, Sig = undefined> =
  (Sig extends undefined ? {} : { sig: SignalsFire<Sig> }) &
  (T['behaviorDefaults'] extends undefined ? {} : { beh: BehaviorsFire<Required<T['behaviorDefaults']>> })

export type createComponent<T extends ComponentSpec> =
  (spec: ComponentSpec) => (view: View, logic?: Logic<any>) => any
