import * as React from 'react'

import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

export type AsObservables<T extends {}> = {
  [k in keyof T]: Observable<T[k]>
}

export type AsSubjects<T extends {}> = {
  [k in keyof T]: Subject<T[k]>
}

export type AsCallbacks<T extends {}> = {
  [k in keyof T]: (k: T[k]) => void
}

export interface LogicParams<Props, UIEvents> {
  props: Observable<Props>
  uiEvents: {
    [k in keyof UIEvents]: Observable<UIEvents[k]>
  }
}

export type Logic<Props, UIEvents = {}, UIState = Props> = (ps: LogicParams<Props, UIEvents>) => Observable<UIState>

export type View<UIEvents = {}, UIState = {}> = (cb: AsCallbacks<UIEvents>) => (s: UIState) => JSX.Element

export interface RxComponentProps<Props, UIEvents = {}, UIState = Props> {
  props: Props
  config: ConfigInternal<UIEvents>
  view: View<UIEvents, UIState>
  logic (ps: LogicParams<any, any>): Observable<any>
}

export interface ConfigOptional<UIEvents> {
  uiEventsNames: (keyof UIEvents)[] // ideally they were just infered from types - but not support at the moment
}

export interface ConfigRequired {}

export interface ConfigInternal<UIEvents> extends ConfigOptional<UIEvents>, ConfigRequired {}

export interface Config<UIEvents> extends Partial<ConfigOptional<UIEvents>>, ConfigRequired {}

export class RxComponent<Props, UIEvents, UIState> extends
  React.Component<RxComponentProps<Props, UIEvents, UIState>> {
  propsSub: BehaviorSubject<Props>
  uiEventsSub: AsSubjects<UIEvents> = {} as any
  uiEventsCb: AsCallbacks<UIEvents> = {} as any
  View: (s: UIState) => JSX.Element
  _state: UIState = {} as any
  sub!: { unsubscribe: () => void }

  constructor (p: RxComponentProps<Props, UIEvents, UIState>) {
    super(p)
    this.propsSub = new BehaviorSubject<Props>(this.props.props)
    p.config.uiEventsNames.forEach(n => {
      this.uiEventsSub[n] = new Subject<UIEvents[keyof UIEvents]>()
      this.uiEventsCb[n] = this.uiEventsSub[n].next.bind(this.uiEventsSub[n])
    })
    this.View = p.view(this.uiEventsCb)
  }

  componentWillReceiveProps (p: RxComponentProps<Props, UIEvents, UIState>) {
    this.propsSub.next(p.props)
  }

  componentDidMount () {
    this.sub = ((this.props.logic && this.props.logic({
      props: this.propsSub,
      uiEvents: this.uiEventsSub
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
    return <this.View {...this._state} />
  }
}

function configWithDefaults <UIEvents> (cfg?: Config<UIEvents>): ConfigInternal<UIEvents> {
  const op: ConfigOptional<UIEvents> = {
    uiEventsNames: []
  }
  return Object.assign(op, cfg)
}

export const rxComponent = <Props, UIEvents = {}, UIState = Props>
  (
    logic: Logic<Props, UIEvents, UIState>,
    view: View<UIEvents, UIState>,
    config?: Config<UIEvents>
  ) =>
  (p: Props) =>
    <RxComponent
      props={p}
      view={view}
      logic={logic as any}
      config={configWithDefaults(config)}
    />
