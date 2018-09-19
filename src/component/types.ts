import { Observable } from 'rxjs'
import * as P from './types.priv'
import { TasksF$, AsTasksIO } from '../tasks'
import { ImmortalSpec } from '../streams'

// weird that TemplateResult not exported
import { html } from 'lit-html/lib/lit-extended'

// todo: try to minimize amount of generics - especially when using it from outside
export interface ComponentSpec<
  State,
  Signals extends {},
  Actions extends AsTasksIO<{}>,
  Behaviors extends {},
  Animate extends keyof Behaviors = keyof Behaviors,
  External extends {} = {}
  > {
  logic?: ImmortalSpec

  behaviorsDefaults?: Required<Behaviors>
  tasks?: TasksF$<Actions>

  // it is not very flexible but should cover 90% of use cases
  animate?: P.Animate<Behaviors, Animate>,

  // todo: hide it from external world - priority very low
  __F$__?: [State, Signals, External]
}

export type Logic<T extends ComponentSpec<any, any, any, any, any, any> = any> =
  (ps: P.LogicParams<T> & { props: Observable<P.SpecToProps<T>> }) => Observable<P.SpecToState<T>>

export type JSXView<T extends ComponentSpec<any, any, any, any, any, any> = any> =
  (ps: P.ViewParams<T>) => (state: P.SpecToState<T>) => JSX.Element

export type CreateJSXComponent<Spec extends ComponentSpec<any, any, any, any, any, any>
  = any> = (spec: Spec,
    view: JSXView<any>, logic: Logic<any>) => (props: P.SpecToProps<Spec>) => JSX.Element // check if props could be removed

export type DOMView<T extends ComponentSpec<any, any, any, any, any, any> = any> =
  (ps: P.ViewParams<T>) => (state: P.SpecToState<T>) => ReturnType<typeof html>

export type CreateLitComponent<Spec extends ComponentSpec<any, any, any, any, any, {}>
  = ComponentSpec<any, any, any, any, any, {}>> = (spec: Spec,
    view: DOMView<any>, logic: Logic<any>) => (root: HTMLElement, ext: P.SpecToExt<Spec>) => void
