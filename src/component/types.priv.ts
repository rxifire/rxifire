import { BehaviorsF$, SignalsF$ } from '../utils/sig-beh'
import { ComponentSpec } from './types'
import { ActionsIn } from '../actions/actions'

type Spec = ComponentSpec<any, any, any, any>

export type SpecToState<T extends Spec> = NonNullable<T['__F$__']>[0]
export type SpecToSig<T extends Spec> = NonNullable<T['__F$__']>[1]
export type SpecToAct<T extends Spec> = NonNullable<T['__F$__']>[2]

export type SignalToBehaviors<S, B, From extends keyof S> = Partial<{
  [To in keyof B]: (curr: B[To], s: S[From]) => B[To]
}>

export type LogicParams<T extends Spec> =
  (SpecToSig<T> extends undefined ? {} : { sig: SignalsF$<SpecToSig<T>> }) &
  (T['defaultBehaviors'] extends undefined ? {} : { beh: BehaviorsF$<NonNullable<T['defaultBehaviors']>> }) &
  (T['actions'] extends undefined ? {} : { eff: ActionsIn<SpecToAct<T>> })

export type ViewParams<T extends Spec> =
  (SpecToSig<T> extends undefined ? {} : { sig: Pick<SignalsF$<SpecToSig<T>>, 'fire'> }) &
  // (T['defaultBehaviors'] extends undefined ? {} : { beh: Pick<BehaviorsF$<NonNullable<T['defaultBehaviors']>>, 'fire' | 'update' | 'reset' | 'v' | 'vs'> }) // todo make it configurable
  (T['defaultBehaviors'] extends undefined ? {} : { beh: Pick<BehaviorsF$<NonNullable<T['defaultBehaviors']>>, Exclude<keyof BehaviorsF$<Required<T['defaultBehaviors']>>, '$' | '$s'>> }) // todo make it configurable
