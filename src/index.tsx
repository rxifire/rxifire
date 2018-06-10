import * as React from 'react'

import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import { tap } from 'rxjs/operators/tap'

interface RouteProps<Props extends {} = {}, Data extends {} = Props, ViewCb extends ViewCbBase = {}> {
  view: (props: any) => JSX.Element
  logic?(params: LogicParams<any, any>): Observable<any>
  props: Props
}

class Route<P, D, V extends ViewCbBase> extends React.Component<RouteProps<P, D, V>, any> {
  propsSub: BehaviorSubject<P>
  View: (data: D & { on: V }) => JSX.Element
  sub: any
  on = {} as V

  constructor (p: RouteProps<P, D, V>) {
    super(p)
    this.View = p.view
    this.propsSub = new BehaviorSubject<P>(this.props.props)
  }

  componentWillReceiveProps (p: RouteProps<P, D, V>) {
    this.propsSub.next(p.props)
  }

  componentDidMount () {
    this.sub = ((this.props.logic && this.props.logic({
      props: this.propsSub,
      viewCb: null as any
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
  [k: string]: (v: any) => void
}

export interface LogicParams<Props, ViewCb extends ViewCbBase> {
  props: Observable<Props>
  viewCb: { [k in keyof ViewCb]: Observable<ViewCb[k]> }
}

export interface RouteConfig<Props extends {} = {}, Data extends {} = Props, ViewCb extends ViewCbBase = {}> {
  view: (data: Data & { on: ViewCb }) => JSX.Element
  logic?(params: LogicParams<Props, ViewCb>): Observable<Data>
}

export const createRoute = <Props, Data = Props, ViewCb extends ViewCbBase = {}> (cfg: RouteConfig<Props, Data, ViewCb>) =>
  (p: Props) =>
    <Route
      props={p}
      view={cfg.view}
      logic={cfg.logic as any}
    />