import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BehaviorSubject, Subscription, Observable, merge, tap } from '../utils'
import { CreateJSXComponent, Logic, ComponentSpec, JSXView } from './types'
import { ctrl } from './component-ctrl'

type Config = {
  spec: ComponentSpec<any, any, any, any, any, any>, logic: Logic<any>, view: JSXView<any>
}

export class JSXBridge extends React.Component<{ props: any, config: Config }> {
  private _ps: BehaviorSubject<any>
  private sub!: Subscription
  private _v!: ReturnType<JSXView<any>>
  private _s!: any

  constructor (p: any) {
    super(p)
    this._ps = new BehaviorSubject(p.props)
  }

  componentWillReceiveProps (p: any) {
    this._ps.next(p.props)
  }

  componentDidMount () {
    console.log(ReactDOM.findDOMNode(this))
    const [state, viewFn, streams] = ctrl(Object.assign({ ext: { props: this._ps } }, this.props.config))
    this._v = viewFn
    this.sub = merge(
      state.pipe(
        tap(s => {
          this._s = s
          this.forceUpdate()
        })
      ),
      ...streams.map(s =>
        s.pipe(tap(() => this.forceUpdate()))
      )
    )
      .subscribe()
  }

  componentWillUnmount () {
    this.sub.unsubscribe()
  }

  render () { return this._s && this._v(this._s) || <div></div> }
}

export const createJSXComponent: CreateJSXComponent = (spec, view, logic) => (props) => {
  return <JSXBridge props={props} config={{ spec, view, logic }} />
}
