import * as React from 'react'

import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import { tap } from 'rxjs/operators/tap'

export interface LogicParams<Props, UIEvents> {
  props: Observable<Props>
  uiEvents:  {
    [k in keyof UIEvents]: Observable<UIEvents[k]>
  }
}

export type Logic<Props, UIEvents, UIState> = (ps: LogicParams<Props, UIEvents>) => Observable<UIState>

export type View<UIState, UIEvents> = (cb: {
  [k in keyof UIEvents]: (k: UIEvents[k]) => void
}) => (s: UIState) => JSX.Element

export interface RxComponentProps<Props, UIState = Props, UIEvents = {}>  {
  view: View<UIState, UIEvents>
  logic(ps: LogicParams<any, any>): Observable<any>
  props: Props
  config: ConfigInternal<UIEvents>
}

export interface ConfigOptional<UIEvents> {
  uiEventsNames: (keyof UIEvents)[] // ideally they were just infered from types - but not support at the moment
}

export interface ConfigRequired {}

export interface ConfigInternal<UIEvents> extends ConfigOptional<UIEvents>, ConfigRequired {}

export interface Config<UIEvents> extends Partial<ConfigOptional<UIEvents>>, ConfigRequired {}

export class RxComponent<P, S, V> extends React.Component<RxComponentProps<P, S, V>, any> {
  propsSub: BehaviorSubject<P>
  View: (data: S & { on: V }) => JSX.Element
  sub: any
  on = {} as V

  constructor (p: RxComponentProps<P, S, V>) {
    super(p)
    this.View = p.view({} as any)
    this.propsSub = new BehaviorSubject<P>(this.props.props)
  }

  componentWillReceiveProps (p: RxComponentProps<P, S, V>) {
    this.propsSub.next(p.props)
  }

  componentDidMount () {
    this.sub = ((this.props.logic && this.props.logic({
      props: this.propsSub,
      uiEvents: null as any
    })) || this.propsSub)
      .pipe(
        tap(p => this.setState(p))
      )
        .subscribe()
  }

  componentWillUnmount () {
    this.sub && this.sub.unsubscribe()
  }

  render () {    
    return <this.View {...this.state} on={this.on} />
  }
}

function configWithDefaults <UIEvents>(cfg?: Config<UIEvents>): ConfigInternal<UIEvents> {
  const op: ConfigOptional<UIEvents> = {
    uiEventsNames: []
  }
  return Object.assign(op, cfg)
}

export const rxComponent = <Props, UIEvents = {}, UIState = Props> 
  (
    logic: Logic<Props, UIEvents, UIState>,
    view: View<UIState, UIEvents>,
    config?: Config<UIEvents>
  ) =>
  (p: Props) =>
    <RxComponent
      props={p}
      view={view}
      logic={logic as any}
      config={configWithDefaults(config)}
    />
