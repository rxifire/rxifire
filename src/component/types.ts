import { Observable } from 'rxjs'
import * as P from './types.priv'
import { AsActions, ActionsF$, AsActionsIO } from '../actions'

export interface ComponentSpec<
  State,
  Signals extends {},
  Actions extends AsActions<AsActionsIO<{}>>,
  Behaviors extends {}> {

  behaviorsDefaults?: Required<Behaviors>
  actions?: ActionsF$<Partial<Actions>>

  // it is not very flexible but should cover 90% of use cases
  animate?: P.Animate<Behaviors>,

  // todo: hide it from external world - priority very low
  __F$__?: [State, Signals]
}

export type Logic<T extends ComponentSpec<any, any, any, any>> = (ps: P.LogicParams<T>) => Observable<P.SpecToState<T>>
export type JSXView<T extends ComponentSpec<any, any, any, any>> = (ps: P.ViewParams<T>) => (state: P.SpecToState<T>) => JSX.Element

export type createJSXComponent<P = {}> =
  (spec: ComponentSpec<any, any, any, any>, view: JSXView<any>, logic?: Logic<any>) =>
    (props: P) => JSX.Element
