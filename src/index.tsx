import * as React from 'react'

import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

import * as eff from './effects'

export {
  eff as effects
}

export type AsObservables<T extends {}> = {
  [k in keyof T]: Observable<T[k]>
}

export type AsSubjects<T extends {}> = {
  [k in keyof T]: Subject<T[k]>
}

export type AsBehaviors<T extends {}> = {
  [k in keyof T]: BehaviorSubject<T[k]>
}

export type AsCallbacks<T extends {}> = {
  [k in keyof T]: (k: T[k]) => void
}

export interface LogicParams<Props, UIEvents, T extends eff.EffectsContract> {
  props: Observable<Props>
  uiEvents: AsObservables<UIEvents>
  effects: eff.Effects<T>
  effInfos: eff.Infos<T>
}

export type Logic<Props, UIEvents = {}, UIState = Props, Contract extends eff.EffectsContract = {}> =
  (ps: LogicParams<Props, UIEvents, Contract>) =>
    Observable<UIState>

export type View<UIEvents = {}, UIState = {}, Contract extends eff.EffectsContract = {}> =
  (cb: AsCallbacks<UIEvents>) => (s: UIState, eff: eff.Infos<Contract>) => JSX.Element

export interface RxComponentProps<Props, UIEvents = {}, UIState = Props, Contract extends eff.EffectsContract = {}> {
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

// todo: temporarily here - convert to immutable, event based solution
export class EffInfo implements eff.Info<any, any> {
  status: eff.Status = 'active'
  error?: any
  value?: any

  constructor (private _afterUpdate: () => void) { }

  is = (s: eff.Status) => s === this.status

  resetTo = (s: 'active' | 'inactive') => this._updateStatus(s)

  private _updateStatus = (s: eff.Status, v?: any) => {
    this.status = s

    if (s === 'error') {
      this.error = v
    } else {
      this.error = undefined
      this.value = v
    }

    this._afterUpdate()
  }
}

export class RxComponent<Props, UIEvents, UIState, Contract extends eff.EffectsContract> extends
  React.Component<RxComponentProps<Props, UIEvents, UIState, Contract>> {
  propsSub: BehaviorSubject<Props>
  uiEventsSub: AsSubjects<UIEvents> = {} as any
  uiEventsCb: AsCallbacks<UIEvents> = {} as any

  fires: AsSubjects<eff.EffectsIn<Contract>> = {} as any
  effects: eff.Effects<Contract> = {} as any
  effInfos: eff.Infos<Contract> = {} as any

  View: (s: UIState, eff: eff.Infos<Contract>) => JSX.Element
  _state: UIState = {} as any
  sub!: { unsubscribe: () => void, add: any }

  constructor (p: RxComponentProps<Props, UIEvents, UIState, Contract>) {
    super(p)
    this.propsSub = new BehaviorSubject<Props>(this.props.props)

    p.config.uiEventsNames.forEach(n => {
      this.uiEventsSub[n] = new Subject<UIEvents[keyof UIEvents]>()
      this.uiEventsCb[n] = this.uiEventsSub[n].next.bind(this.uiEventsSub[n])
    })

    Object.keys(p.effects).forEach(e => {
      const eff = p.effects[e]
      this.effInfos[e] = new EffInfo(() => this.forceUpdate)

      this.effects[e] = p => {
        return eff(p)
      }
    })

    this.View = p.view(this.uiEventsCb)

  }

  componentWillReceiveProps (p: RxComponentProps<Props, UIEvents, UIState, Contract>) {
    this.propsSub.next(p.props)
  }

  componentDidMount () {
    this.sub = ((this.props.logic && this.props.logic({
      props: this.propsSub,
      uiEvents: this.uiEventsSub,
      effects: this.effects,
      effInfos: this.effInfos
    })) || this.propsSub)
      .subscribe(s => {
        this._state = s
        this.forceUpdate()
      })
  }

  componentWillUnmount () {
    this.sub && this.sub.unsubscribe()
  }

  render () {
    return this.View(this._state, this.effInfos)
  }
}

function configWithDefaults<UIEvents> (cfg?: Config<UIEvents>): ConfigInternal<UIEvents> {
  const op: ConfigOptional<UIEvents> = {
    uiEventsNames: []
  }
  return Object.assign(op, cfg)
}

export const createRxComponent = <
  Props,
  UIEvents = {},
  UIState = Props,
  Contract extends eff.EffectsContract = {}>
  (
  logic: Logic<Props, UIEvents, UIState, Contract>,
  view: View<UIEvents, UIState, Contract>,
  effects: eff.Effects<Contract>,
  config?: Config<UIEvents>
  ) =>
  (p: Props) =>
    <RxComponent
      props={p}
      logic={logic as any}
      view={view}
      effects={effects}
      config={configWithDefaults(config)}
    />
