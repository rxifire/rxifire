import * as React from 'react'

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

import { tap } from 'rxjs/operators/tap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { finalize } from 'rxjs/operators/finalize'
import { filter } from 'rxjs/operators/filter'
import { switchMap } from 'rxjs/operators/switchMap'
import { retryWhen } from 'rxjs/operators/retryWhen'
import { defer } from 'rxjs/observable/defer'

import * as E from '../effects/types'
import * as H from '../utils/types'
import * as T from './types'

export class EffInfo {
  _status = new BehaviorSubject<E.EffStatus>('active')
  error?: any
  result?: any

  get status () { return this._status.value }

  constructor (private _afterUpdate: () => void) { }

  is = (s: E.EffStatus) => s === this.status

  reset = () => this._updateStatus('active')

  _updateStatus = (s: E.EffStatus, v?: any) => {
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

export class LogicMeta {
  _status = new BehaviorSubject<T.LogicStatus>('loading')
  // resets = new Subject<never>()

  error?: any

  get status () { return this._status.value }

  is = (s: T.LogicStatus) => s === this._status.value
  reset = () => {
    this.error = undefined
    this._status.next('loading')
  }
}

// TODO: make it 100% React free
export class ComponentCtrl<UIEvents extends {}, UIState extends {}, Contract extends E.EffectsContract> {
  meta: LogicMeta
  uiEventsSub: H.AsSubjects<UIEvents> = {} as any
  uiEventsCb: H.AsCallbacks<UIEvents> = {} as any

  effects!: E.EffectsLogic<Contract>

  View: (s: UIState, extra: T.ViewExtra<Contract>) => JSX.Element
  viewExtra!: any // T.ViewExtra<Contract>

  _state: UIState | null = null
  sub!: { unsubscribe: () => void, add: any }

  cfg: T.RxComponentProps<{}, UIEvents, UIState, Contract>
  onUpdate!: () => void

  constructor (cfg: T.RxComponentProps<{}, UIEvents, UIState, Contract>) {
    // this.propsSub = new BehaviorSubject<Props>(this.props.props)
    this.cfg = cfg
    this.meta = new LogicMeta()

    cfg.config.uiEventsNames.forEach(n => {
      this.uiEventsSub[n] = new Subject<UIEvents[keyof UIEvents]>()
      this.uiEventsCb[n] = this.uiEventsSub[n].next.bind(this.uiEventsSub[n])
    })

    this.View = cfg.view(this.uiEventsCb)

    this._initEffects(cfg)
  }

  public render () {
    // todo: improve 'loading', either wait for state or require a loading template
    return (this._state || this.cfg.config.unsafeLoading) && this.View(this._state!, this.viewExtra)
  }

  public activate = (onUpdate: () => void, propsSub: BehaviorSubject<any>) => {
    this.onUpdate = onUpdate
    this.sub = this.meta._status
      .pipe(
        filter(s => s === 'loading'),
        tap(() => {
          this._initEffects(this.cfg)
          this._state = null
          this.onUpdate()
        }),
        switchMap(() =>
          this.cfg.logic({
            props: propsSub,
            uiEvents: this.uiEventsSub,
            eff: this.effects,
            meta: this.meta // most likely not needed here
          })
            .pipe(
              tap(
                (s) => {
                  this.meta.is('loading') && this.meta._status.next('active')
                  this._state = s
                  this.onUpdate()
                },
                (err) => {
                  this.meta.error = err
                  this.meta._status.next('error')
                  this.onUpdate()
                },
                () => {
                  this.meta._status.next('completed')
                  this.onUpdate()
                }
              ),
              retryWhen(() => this.meta._status)
            )
        )
      )
      .subscribe()
  }

  public dispose = () => this.sub && this.sub.unsubscribe()

  private _initEffects (p: { effects: E.Effects<Contract>}) {
    const f = {}
    const i = {};
    (this.effects as E.EffectsLogic<{}>) = {
      f, fire: f, i, info: i
    }
    this.viewExtra = {
      eff: this.effects.i,
      meta: this.meta
    }
    Object.keys(p.effects).forEach(e => {
      const eff = p.effects[e]
      const info = this.effects.i[e] = new EffInfo(() => this.onUpdate)

      this.effects.f[e] = p => {
        if (info.is('active')) {
          info._updateStatus('in-progress')
          this.onUpdate()
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

export class ReactComponent<Props extends {}, UIEvents, UIState, Contract extends E.EffectsContract>
  extends React.Component<T.RxComponentProps<Props, UIEvents, UIState, Contract>> {
  propsSub: BehaviorSubject<Props>
  ctrl: ComponentCtrl<UIEvents, UIState, Contract>

  constructor (p: T.RxComponentProps<Props, UIEvents, UIState, Contract>) {
    super(p)
    this.propsSub = new BehaviorSubject<Props>(this.props.props)
    this.ctrl = new ComponentCtrl(this.props)
  }

  componentWillReceiveProps (p: T.RxComponentProps<Props, UIEvents, UIState, Contract>) {
    this.propsSub.next(p.props)
  }

  componentDidMount () {
    this.ctrl.activate(this.forceUpdate.bind(this), this.propsSub)
  }

  componentWillUnmount () {
    this.ctrl.dispose()
  }

  render () { return this.ctrl.render() }
}

function configWithDefaults<UIEvents> (cfg?: T.Config<UIEvents>): T.ConfigInternal<UIEvents> {
  const op: T.ConfigOptional<UIEvents> = {
    uiEventsNames: [],
    unsafeLoading: false
  }
  return Object.assign(op, cfg)
}
