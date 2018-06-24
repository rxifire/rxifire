import { Observable } from 'rxjs'
import { BehaviorsFire, SignalsFire } from '../utils/sig-beh'

export type Logic = (ps: any) => Observable<any>

export type View = (state: any, ps: any) => JSX.Element

export type ComponentSpec<Behaviors = {}> = {
  behaviorDefaults?: Behaviors
}

export type LogicParams<T extends ComponentSpec, Sig = undefined> =
  (Sig extends undefined ? {} : { sig: SignalsFire<Sig> }) &
  (T['behaviorDefaults'] extends undefined ? {} : { beh: BehaviorsFire<NonNullable<T['behaviorDefaults']>> })

export type ViewParams<T extends ComponentSpec, Sig = undefined> =
  (Sig extends undefined ? {} : { sig: SignalsFire<Sig> }) &
  (T['behaviorDefaults'] extends undefined ? {} : { beh: BehaviorsFire<Required<T['behaviorDefaults']>> })

export type createComponent<T extends ComponentSpec> =
  (spec: ComponentSpec) => (view: View, logic?: Logic) => any
