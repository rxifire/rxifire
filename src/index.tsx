import * as React from 'react'

import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

import { tap } from 'rxjs/operators/tap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { finalize } from 'rxjs/operators/finalize'
import { filter } from 'rxjs/operators/filter'
import { defer } from 'rxjs/observable/defer'

import * as T from './types'

export * from './types'
export {
  T,
  T as types
}

// todo: temporarily here - convert to immutable, event based solution
export class EffInfo implements T.EffInfo<any, any> {
  _status = new BehaviorSubject<T.EffStatus>('active')
  error?: any
  result?: any

  get status () { return this._status.value }

  constructor (private _afterUpdate: () => void) { }

  is = (s: T.EffStatus) => s === this.status

  reset = () => this._updateStatus('active')

  _updateStatus = (s: T.EffStatus, v?: any) => {
    if (s === 'error') {
      this.error = v
    } else {
      this.error = undefined
      this.result = v
    }
    this._status.next(s)
    this._afterUpdate()
  }
}

export class RxComponent<Props extends {}, UIEvents extends {}, UIState extends {}, Contract extends T.EffectsContract> extends
  React.Component<T.RxComponentProps<Props, UIEvents, UIState, Contract>> {
  propsSub: BehaviorSubject<Props>
  uiEventsSub: T.AsSubjects<UIEvents> = {} as any
  uiEventsCb: T.AsCallbacks<UIEvents> = {} as any

  effects: T.EffectsObs<Contract> = {} as any
  effInfos: T.EffInfos<Contract> = {} as any

  View: (s: UIState, eff: T.EffInfos<Contract>) => JSX.Element
  _state: UIState | null = null
  sub!: { unsubscribe: () => void, add: any }

  constructor (p: T.RxComponentProps<Props, UIEvents, UIState, Contract>) {
    super(p)
    this.propsSub = new BehaviorSubject<Props>(this.props.props)

    p.config.uiEventsNames.forEach(n => {
      this.uiEventsSub[n] = new Subject<UIEvents[keyof UIEvents]>()
      this.uiEventsCb[n] = this.uiEventsSub[n].next.bind(this.uiEventsSub[n])
    })

    this.View = p.view(this.uiEventsCb)

    this._initEffects(p)
  }

  componentWillReceiveProps (p: T.RxComponentProps<Props, UIEvents, UIState, Contract>) {
    this.propsSub.next(p.props)
  }

  componentDidMount () {
    this.sub = this.props.logic({
      props: this.propsSub,
      uiEvents: this.uiEventsSub,
      eff: this.effects,
      effInfos: this.effInfos
    })
      .subscribe(s => {
        this._state = s
        this.forceUpdate()
      })
  }

  componentWillUnmount () {
    this.sub && this.sub.unsubscribe()
  }

  render () {
    return this._state && this.View(this._state, this.effInfos)
  }

  private _initEffects (p: T.RxComponentProps<Props, UIEvents, UIState, Contract>) {
    Object.keys(p.effects).forEach(e => {
      const eff = p.effects[e]
      const info = this.effInfos[e] = new EffInfo(() => this.forceUpdate)

      this.effects[e] = p => {
        if (info.is('active')) {
          info._updateStatus('in-progress')
          this.forceUpdate()
          return defer(() => eff(p)) // Observable or promise
            .pipe(
              tap(
                v => info._updateStatus('success', v),
                e => info._updateStatus('error', e)
              ),
              takeUntil(
                info._status.pipe(
                  filter(s => !(s === 'success' || s === 'in-progress'))
                  // tap(() => info.is('in-progress') && info.reset())
                )
              ),
              finalize(() => {
                console.log('FINALIZE', info.status) // cancelled
                info.is('in-progress') && info.reset()
              })
            )
        }
        throw new Error('ALREADY_RUNNING')
      }
    })
  }

}

function configWithDefaults<UIEvents> (cfg?: T.Config<UIEvents>): T.ConfigInternal<UIEvents> {
  const op: T.ConfigOptional<UIEvents> = {
    uiEventsNames: []
  }
  return Object.assign(op, cfg)
}

export const createRxComponent = <
  Props,
  UIEvents = {},
  UIState = Props,
  Contract extends T.EffectsContract = {}>
  (
  logic: T.Logic<Props, UIEvents, UIState, Contract>,
  view: T.View<UIEvents, UIState, Contract>,
  effects: T.Effects<Contract>,
  config?: T.Config<UIEvents>
  ) =>
  (p: Props) =>
    <RxComponent
      props={p}
      logic={logic as any}
      view={view}
      effects={effects}
      config={configWithDefaults(config)}
    />
