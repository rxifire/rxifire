import { render, html } from 'lit-html'

import { Subscription, tap, animationFrame, observeOn } from '../utils'
import { SignalsF$, BehaviorsF$, ImmortalF$ } from '../streams'
import { CreateDOMComponent, Logic, ComponentSpec, DOMView } from './types'

type Config = {
  el: HTMLElement, ext: any,
  spec: ComponentSpec<any, any, any, any, any, any>, logic: Logic<any>, view: DOMView<any>
}

const tangle = ({ spec, logic, view, ext }: Config) => {
  const beh = spec.behaviorsDefaults && new BehaviorsF$(spec.behaviorsDefaults)
  const ani = spec.animate && new BehaviorsF$(spec.animate)
  const sig = new SignalsF$()
  const log = new ImmortalF$(logic({ beh, sig, tsk: spec.tasks, ...ext }))

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

export class DOMBridge {
  private sub!: Subscription
  private _v!: ReturnType<DOMView<any>>
  private _s!: any

  constructor (readonly c: Config) {
    const { logic, view, beh, tsk, ani } = tangle(this.c)
    this._v = view
    this.sub = logic.run
      .pipe(tap(s => { this._s = s; this.forceUpdate() }))
      .subscribe()

    beh && this.sub.add(beh.changed.pipe(tap(() => this.forceUpdate())).subscribe())
    tsk && this.sub.add(tsk.$s().pipe(observeOn(animationFrame), tap(() => this.forceUpdate())).subscribe())
    if (ani) {
      const ks = Object.keys(this.c.spec.animate!)
      const bs = beh!.$s(ks as any)
      console.log(bs, ks, ani, this.c.spec.animate)
      ks.forEach(k => this.sub.add(
        (bs as any)[k]
          .pipe(
            (this.c.spec.animate![k]),
            tap(v => { (ani as any).fire(k)(v); this.forceUpdate() })
          )
          .subscribe())
      )
    }
  }

  dispose () {
    // interesting how to achieve smooth composition
    // some ideas: mutation observer, morphdom built-in options, global registry of mounted
    this.sub.unsubscribe()
  }

  forceUpdate = () => {
    const e = this._s && this._v(this._s) || null
    console.log('E', e)
    if (e) (render)(e, this.c.el)
  }
}

export const createDOMComponent: CreateDOMComponent = (spec, view, logic) => (el, ext) =>
  new DOMBridge({ el, ext, spec, view, logic })
