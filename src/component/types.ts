import { Observable } from 'rxjs'
import { BehaviorsF$, SignalsF$ } from '../utils/sig-beh'

type SpecToSig<T extends ComponentSpec> = NonNullable<T['__F$__']>[1]
type SpecToState<T extends ComponentSpec> = NonNullable<T['__F$__']>[0]

type LogicParams<T extends ComponentSpec> =
  (SpecToSig<T> extends undefined ? {} : { sig: SignalsF$<SpecToSig<T>> }) &
  (T['behaviorDefaults'] extends undefined ? {} : { beh: BehaviorsF$<NonNullable<T['behaviorDefaults']>> })

type ViewParams<T extends ComponentSpec> =
  (SpecToSig<T> extends undefined ? {} : { sig: SignalsF$<SpecToSig<T>> }) &
  (T['behaviorDefaults'] extends undefined ? {} : { beh: BehaviorsF$<Required<T['behaviorDefaults']>> })

export type Logic<T extends ComponentSpec> = (ps: LogicParams<T>) => Observable<SpecToState<T>>

export type View = (state: any, ps: any) => JSX.Element

export type ComponentSpec<State = {}, Signals extends {} = {}, Behaviors extends {} = {}> = {
  behaviorDefaults?: Behaviors

  externalStreams?: any

  // todo: hide it from external world - priority very low
  __F$__?: [State, Signals]
}

export type createComponent =
  (spec: ComponentSpec) => (view: View, logic?: Logic<any>) => any
