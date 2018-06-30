import { Observable } from 'rxjs/Observable'
import { BehaviorsF$, SignalsF$ } from '../streams'
import { ComponentSpec } from './types'

type Spec = ComponentSpec<any, any, any, any>

export type SpecToState<T extends Spec> = NonNullable<T['__F$__']>[0]
export type SpecToSig<T extends Spec> = NonNullable<T['__F$__']>[1]

export type Animate<Behaviors extends {}> = {
  [K in keyof Behaviors]?: (v: Observable<Behaviors[K]>) => Observable<number | Behaviors[K] | string>
}

type AnimateToLogic<A extends Animate<any>> = NonNullable<{ [P in keyof A]: NonNullable<ReturnType<NonNullable<A[P]>>> }>
type AnimateToView<A extends Animate<any>> = NonNullable<{
  [P in keyof A]: ReturnType<NonNullable<A[P]>> extends Observable<infer U> ? U : never
}>

export type LogicParams<T extends Spec> =
  (SpecToSig<T> extends undefined ? {} : { sig: SignalsF$<SpecToSig<T>> }) &
  (T['actions'] extends undefined ? {} : { act: NonNullable<T['actions']> }) &
  (T['animate'] extends undefined ? {} : { ani: AnimateToLogic<NonNullable<T['animate']>> }) &
  (T['behaviorsDefaults'] extends undefined ? {} : { beh: BehaviorsF$<NonNullable<T['behaviorsDefaults']>> })

export type ViewParams<T extends Spec> =
  (SpecToSig<T> extends undefined ? {} : { sig: Pick<SignalsF$<SpecToSig<T>>, 'fire'> }) &
  (T['actions'] extends undefined ? {} : { act: Pick<NonNullable<T['actions']>, 'meta' | 'is'> }) &
  (T['animate'] extends undefined ? {} : { ani: AnimateToView<NonNullable<T['animate']>> }) &
  (T['behaviorsDefaults'] extends undefined ? {} : { beh: Pick<BehaviorsF$<NonNullable<T['behaviorsDefaults']>>, Exclude<keyof BehaviorsF$<Required<T['behaviorsDefaults']>>, '$' | '$s'>> }) // todo make it configurable
