import { BehaviorsF$, SignalsF$ } from '../streams'
import { ComponentSpec } from './types'
import { AsActions } from '../actions/types'

type Spec = ComponentSpec<any, any, any, any>

export type SpecToState<T extends Spec> = NonNullable<T['__F$__']>[0]
export type SpecToSig<T extends Spec> = NonNullable<T['__F$__']>[1]
export type SpecToAct<T extends Spec> = NonNullable<T['__F$__']>[2]

export type SignalToBehaviors<S, B, From extends keyof S> = Partial<{
  [To in keyof B]: (curr: B[To], s: S[From]) => B[To]
}>

export type LogicParams<T extends Spec> =
  (SpecToSig<T> extends undefined ? {} : { sig: SignalsF$<SpecToSig<T>> }) &
  (T['behaviorsDefaults'] extends undefined ? {} : { beh: BehaviorsF$<NonNullable<T['behaviorsDefaults']>> }) &
  (T['actions'] extends undefined ? {} : { eff: AsActions<SpecToAct<T>> })

export type ViewParams<T extends Spec> =
  (SpecToSig<T> extends undefined ? {} : { sig: Pick<SignalsF$<SpecToSig<T>>, 'fire'> }) &
  // (T['defaultBehaviors'] extends undefined ? {} : { beh: Pick<BehaviorsF$<NonNullable<T['defaultBehaviors']>>, 'fire' | 'update' | 'reset' | 'v' | 'vs'> }) // todo make it configurable
  (T['behaviorsDefaults'] extends undefined ? {} : { beh: Pick<BehaviorsF$<NonNullable<T['behaviorsDefaults']>>, Exclude<keyof BehaviorsF$<Required<T['behaviorsDefaults']>>, '$' | '$s'>> }) // todo make it configurable
