import { Observable } from 'rxjs/Observable'

import * as eff from './effects'
import { AsObservables, AsCallbacks } from './helpers'

export type LogicStatus = 'loading' | 'active' | 'completed' | 'error'

export interface Meta {
  status: LogicStatus
  is: (s: LogicStatus) => boolean
  reset: () => void // back to loading, very powerful, should be hidden in the config
}

export interface LogicParams<Props extends {}, UIEvents extends {}, T extends eff.EffectsContract> {
  props: Observable<Props>
  uiEvents: AsObservables<UIEvents>
  meta: Meta
  eff: eff.EffectsLogic<T>
}

export type Logic<Props extends {}, UIEvents extends {}, UIState extends {}, Contract extends eff.EffectsContract> =
  (ps: LogicParams<Props, UIEvents, Contract>) =>
    Observable<UIState>

export interface ViewExtra<C extends eff.EffectsContract> {
  eff: eff.EffectsInfos<C>,
  meta: Meta
}

export type View<UIEvents, UIState, Contract extends eff.EffectsContract> =
  (cb: AsCallbacks<UIEvents>) => (s: UIState, extra: ViewExtra<Contract>) => JSX.Element

export interface RxComponentProps<Props extends {}, UIEvents extends {}, UIState extends {}, Contract extends eff.EffectsContract> {
  props: Props
  config: ConfigInternal<UIEvents>
  view: View<UIEvents, UIState, Contract>
  effects: eff.Effects<Contract>
  logic (ps: LogicParams<any, any, any>): Observable<any>
}

export interface ConfigOptional<UIEvents> {
  uiEventsNames: (keyof UIEvents)[] // ideally they were just infered from types - but not support at the moment
}

export interface ConfigRequired { }

export interface ConfigInternal<UIEvents> extends ConfigOptional<UIEvents>, ConfigRequired { }

export interface Config<UIEvents> extends Partial<ConfigOptional<UIEvents>>, ConfigRequired { }
