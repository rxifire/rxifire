import { Observable } from 'rxjs/Observable'

import * as eff from './effects'
import { AsObservables, AsCallbacks } from './helpers'

export interface LogicParams<Props extends {}, UIEvents extends {}, T extends eff.EffectsContract> {
  props: Observable<Props>
  uiEvents: AsObservables<UIEvents>
  effects: eff.Effects<T>
  effInfos: eff.EffInfos<T>
}

export type Logic<Props extends {}, UIEvents extends {}, UIState extends {}, Contract extends eff.EffectsContract> =
  (ps: LogicParams<Props, UIEvents, Contract>) =>
    Observable<UIState>

export type View<UIEvents, UIState, Contract extends eff.EffectsContract> =
  (cb: AsCallbacks<UIEvents>) => (s: UIState, eff: eff.EffInfos<Contract>) => JSX.Element

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
