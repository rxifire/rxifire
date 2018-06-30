import { Observable } from 'rxjs/Observable'
import { BehaviorsF$, SignalsF$, ImmortalF$ } from '../streams'
import { ComponentSpec } from './types'

type Spec = ComponentSpec<any, any, any, any, never>

export type SpecToState<T extends Spec> = NonNullable<T['__F$__']>[0]
export type SpecToSig<T extends Spec> = NonNullable<T['__F$__']>[1]
export type SpecToExt<T extends Spec> = NonNullable<T['__F$__']>[2]

export type Animate<Behaviors extends {}, Ks extends keyof Behaviors = never> = {
  [K in Ks]: (v: Observable<Behaviors[K]>) => Observable<Behaviors[K]>
}

type AnimateToView<A extends Animate<any, any>> = {
  [P in keyof A]: A[P] extends undefined ? never :
  (ReturnType<NonNullable<A[P]>> extends Observable<infer U> ? U : 'dupa')
}

export type LogicParams<T extends Spec> =
  (SpecToSig<T> extends undefined ? {} : { sig: SignalsF$<SpecToSig<T>> }) &
  (T['actions'] extends undefined ? {} : { act: NonNullable<T['actions']> }) &
  (T['behaviorsDefaults'] extends undefined ? {} : { beh: BehaviorsF$<NonNullable<T['behaviorsDefaults']>> }) &
  SpecToExt<T>

export type ViewParams<T extends Spec> =
  (SpecToSig<T> extends undefined ? {} : { sig: Pick<SignalsF$<SpecToSig<T>>, 'fire'> }) &
  (T['actions'] extends undefined ? {} : { act: Pick<NonNullable<T['actions']>, 'meta' | 'is'> }) &
  (T['animate'] extends undefined ? {} : { ani: AnimateToView<NonNullable<T['animate']>> }) &
  (T['behaviorsDefaults'] extends undefined ? {} : { beh: Pick<BehaviorsF$<NonNullable<T['behaviorsDefaults']>>, Exclude<keyof BehaviorsF$<Required<T['behaviorsDefaults']>>, '$' | '$s'>> }) &
  ({ meta: Pick<ImmortalF$<any, SpecToState<T>>, 'is' | 'as'>})
