import * as React from 'react'

import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

import { tap } from 'rxjs/operators/tap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { finalize } from 'rxjs/operators/finalize'
import { filter } from 'rxjs/operators/filter'
import { switchMap } from 'rxjs/operators/switchMap'
import { retryWhen } from 'rxjs/operators/retryWhen'
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

export class LogicMeta implements T.Meta {
  _status = new BehaviorSubject<T.LogicStatus>('loading')
  // resets = new Subject<never>()

  error?: any

  get status () { return this._status.value }

  is = (s: T.LogicStatus) => s === this._status.value
  reset = () => this._status.next('loading')

}

export class RxComponent<Props extends {}, UIEvents extends {}, UIState extends {}, Contract extends T.EffectsContract> extends
  React.Component<T.RxComponentProps<Props, UIEvents, UIState, Contract>> {
  propsSub: BehaviorSubject<Props>
  meta: LogicMeta
  uiEventsSub: T.AsSubjects<UIEvents> = {} as any
  uiEventsCb: T.AsCallbacks<UIEvents> = {} as any

  effects!: T.EffectsLogic<Contract>

  View: (s: UIState, extra: T.ViewExtra<Contract>) => JSX.Element
  viewExtra!: T.ViewExtra<Contract>

  _state: UIState | null = null
  sub!: { unsubscribe: () => void, add: any }

  constructor (p: T.RxComponentProps<Props, UIEvents, UIState, Contract>) {
    super(p)
    this.propsSub = new BehaviorSubject<Props>(this.props.props)
    this.meta = new LogicMeta()

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
    this.sub = this.meta._status
      .pipe(
        filter(s => s === 'loading'),
        tap(() => this._initEffects(this.props)),
        switchMap(() =>
          this.props.logic({
            props: this.propsSub,
            uiEvents: this.uiEventsSub,
            eff: this.effects,
            meta: this.meta // most likely not needed here
          })
            .pipe(
              tap(
                (s) => {
                  this.meta.is('loading') && this.meta._status.next('active')
                  this._state = s
                  this.forceUpdate()
                },
                (err) => {
                  this.meta.error = err
                  this.meta._status.next('error')
                  this.forceUpdate()
                },
                () => {
                  this.meta._status.next('completed')
                  this.forceUpdate()
                }
              ),
              retryWhen(() => this.meta._status)
            )
        )
      )
      .subscribe()
  }

  componentWillUnmount () {
    this.sub && this.sub.unsubscribe()
  }

  render () {
    console.log('EXTRA', this.viewExtra)
    return this._state && this.View(this._state, this.viewExtra)
  }

  private _initEffects (p: T.RxComponentProps<Props, UIEvents, UIState, Contract>) {
    const f = {}
    const i = {};
    (this.effects as T.EffectsLogic<{}>) = {
      f, fire: f, i, info: i
    }
    this.viewExtra = {
      eff: this.effects.i,
      meta: this.meta
    }
    Object.keys(p.effects).forEach(e => {
      const eff = p.effects[e]
      const info = this.effects.i[e] = new EffInfo(() => this.forceUpdate)

      this.effects.f[e] = p => {
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
  UIState = {},
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
