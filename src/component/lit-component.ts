import { render } from 'lit-html'

import { Subscription, tap, Observable, merge } from '../utils'
import { CreateDOMComponent, Logic, ComponentSpec, DOMView } from './types'
import { ctrl } from './component-ctrl'

type Config = {
  el: HTMLElement, ext: any,
  spec: ComponentSpec<any, any, any, any, any, any>, logic: Logic<any>, view: DOMView<any>
}

export class DOMBridge {
  private sub: Subscription

  constructor (readonly c: Config) {
    const [state, viewFn, streams] = ctrl(c) as [Observable<any>, (s: any) => any, Observable<any>[]]
    let _s: any = null
    this.sub = merge(
      state.pipe(
        tap(s => { // theoretically rendered view could be passed, but lit-html do not refresh
          _s = s
          render(viewFn(s), this.c.el)
        })
      ),
      ...streams.map(s =>
        s.pipe(tap(() => _s && render(viewFn(_s), this.c.el))))
    )
      .subscribe()
  }

  dispose () {
    // interesting how to achieve smooth composition
    // some ideas: mutation observer, morphdom built-in options, global registry of mounted, webcomponents connected / disconnected
    // auto inject slots
    this.sub.unsubscribe()
  }
}

export const createDOMComponent: CreateDOMComponent = (spec, view, logic) => (el, ext) =>
  new DOMBridge({ el, ext, spec, view, logic })
