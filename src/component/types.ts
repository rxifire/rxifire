import { Observable } from 'rxjs'
import * as P from './types.priv'
import { AsTasks, TasksF$, AsTasksIO } from '../tasks'
import { ImmortalSpec } from '../streams'

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

export type Logic<T extends ComponentSpec<any, any, any, any, any, any>> = (ps: P.LogicParams<T> & External) => Observable<P.SpecToState<T>>
export type JSXView<T extends ComponentSpec<any, any, any, any, any, any>> = (ps: P.ViewParams<T>) => (state: P.SpecToState<T>) => JSX.Element

export type CreateJSXComponent<P = {}> = (spec: ComponentSpec<any, any, any, any, any, { props: Observable<P> }>,
  view: JSXView<any>, logic: Logic<any>) => (props: P) => JSX.Element // check if props could be removed
