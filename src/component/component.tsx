import * as React from 'react'
import { $, BehaviorSubject, Subscription, tap } from '../utils'
import { SignalsF$, BehaviorsF$, ImmortalF$ } from '../streams'
import { CreateJSXComponent, Logic, ComponentSpec, JSXView } from './types'

type Config = {
  spec: ComponentSpec<any, any, any, any, any, any>, logic: Logic<any>, view: JSXView<any>
}

const tangle = ({ spec, logic, view }: Config, external?: any) => {
  const beh = spec.behaviorsDefaults && new BehaviorsF$(spec.behaviorsDefaults)
  const sig = new SignalsF$()
  const log = new ImmortalF$(logic({ beh, sig, tsk: spec.tasks, ...external }))

  const v = view({ beh, sig, meta: log, tsk: spec.tasks })

  return {
    logic: log,
    view: v,
    beh,
    sig
  }
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
    const { logic, view } = tangle(this.props.config)
    this._v = view
    this.sub = logic.run
      .pipe(tap(s => { this._s = s; this.forceUpdate() }))
      .subscribe()
  }

  componentWillUnmount () {
    this.sub.unsubscribe()
  }

  render () { return this._v && this._v(this._s) || null }
}

export const createJSXComponent: CreateJSXComponent = (spec, view, logic) => props => {
  return <JSXBridge props={props} config={{ spec, view, logic }} />
}
