import * as React from 'react'

import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import { tap } from 'rxjs/operators/tap'

interface RxComponentProps<Props, UIState = Props, UIEvents = {}>  {
  view: View<UIState, UIEvents>
  logic(params: LogicParams<any, any>): Observable<any>
  props: Props
}

class RxComponent<P, S, V> extends React.Component<RxComponentProps<P, S, V>, any> {
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
    if (!this.propsSub) return null
    
    return <this.View {...this.state} on={this.on} />
  }
}

export interface ViewCbBase {
  [k: string]: ([...any]) => void
}

export interface LogicParams<Props, UIEvents> {
  props: Observable<Props>
  uiEvents:  {
    [k in keyof UIEvents]: Observable<UIEvents[k]>
  }
}

export type View<UIState, UIEvents> = (cb: {
  [k in keyof UIEvents]: (k: UIEvents[k]) => void
}) => (s: UIState) => JSX.Element

export interface RxComponentConfig<UIEvents> {
  uiEventsNames?: (keyof UIEvents)[]
}

export const rxComponent = <Props, UIState = Props, UIEvents = {}> 
  (
    logic: (ps: LogicParams<Props, UIEvents>) => Observable<UIEvents>,
    view: View<UIState, UIEvents>,
    cfg?: RxComponentConfig<UIEvents>
  ) =>
  //(cfg: RouteConfig<Props, Data, ViewCb>) =>
  (p: Props) =>
    <RxComponent
      props={p}
      view={view}
      logic={logic as any}
    />