import * as React from 'react'
import { BehaviorSubject, Subscription, Observable, tap, animationFrame, observeOn } from '../utils'
import { SignalsF$, BehaviorsF$, ImmortalF$ } from '../streams'
import { CreateJSXComponent, JSXLogic, ComponentSpec, JSXView } from './types'

type Config = {
  spec: ComponentSpec<any, any, any, any, any, any>, logic: JSXLogic<any>, view: JSXView<any>
}

const tangle = ({ spec, logic, view }: Config, external?: any) => {
  const beh = spec.behaviorsDefaults && new BehaviorsF$(spec.behaviorsDefaults)
  const ani = spec.animate && new BehaviorsF$(spec.animate)
  const sig = new SignalsF$()
  const log = new ImmortalF$(logic({ beh, sig, tsk: spec.tasks, ...external }))

  const v = view({ beh, sig, meta: log, tsk: spec.tasks, ani })

  return {
    logic: log,
    view: v,
    beh,
    sig,
    ani,
    tsk: spec.tasks
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
    const { logic, view, beh, tsk, ani } = tangle(this.props.config, { props: this._ps })
    this._v = view
    this.sub = logic.run
      .pipe(tap(s => { this._s = s; this.forceUpdate() }))
      .subscribe()

    beh && this.sub.add(beh.changed.pipe(tap(() => this.forceUpdate())).subscribe())
    tsk && this.sub.add(tsk.$s().pipe(observeOn(animationFrame), tap(() => this.forceUpdate())).subscribe())
    if (ani) {
      const ks = Object.keys(this.props.config.spec.animate!)
      const bs = beh!.$s(ks as any)
      console.log(bs, ks, ani, this.props.config.spec.animate)
      ks.forEach(k => this.sub.add(
        (bs as any)[k]
          .pipe(
            (this.props.config.spec.animate![k]),
            tap(v => { (ani as any).fire(k)(v); this.forceUpdate() })
          )
          .subscribe())
      )
    }
  }

  componentWillUnmount () {
    this.sub.unsubscribe()
  }

  render () { return this._s && this._v(this._s) || null }
}

export const createJSXComponent: CreateJSXComponent = (spec, view, logic) => (props) => {
  return <JSXBridge props={props} config={{ spec, view, logic }} />
}
