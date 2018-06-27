
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { tap } from 'rxjs/operators/tap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { finalize } from 'rxjs/operators/finalize'
import { filter } from 'rxjs/operators/filter'
import { share } from 'rxjs/operators/share'
import { timeout } from 'rxjs/operators/timeout'
import { take } from 'rxjs/operators/take'

import * as P from './types.priv'
import * as T from './types'
import { DateMs } from '../utils/types'
import { _throw, ErrorCode, _unreachable } from '../utils/errors'

export * from './types'

const $ = Observable

export class ActionsF$<A extends T.AsActionsIO<any>> {
  private static readonly _empty = {}
  public readonly keys: (keyof A)[]
  private _acts: P.Internal<A> = {} as P.Internal<A>
  // private _cache: { [K in keyof A]?: A[K][1] } = {}
  private _ms: () => DateMs
  private _until = new Subject<keyof A>()

  constructor (actions: T.Actions<A>, spec: T.ActionsSpec<A> = {}, timeMs = () => Date.now()) {
    this._ms = timeMs
    this.keys = Object.keys(actions)
    this._acts = this.keys
      .reduce((acc, k) => {
        acc[k] = [
          (actions[k] as any), { status: 'idle' },
          { _status: new Subject(), _updates: new Subject(), _warn: new Subject() },
          spec[k] as any || ActionsF$._empty
        ]
        return acc
      }, {} as P.Internal<A>)
  }

  $ = <K extends keyof A> (k: K): (<T extends P.AvailableStreams<A[K][2]>>(t?: T) =>
    P.StreamToUpdates<T, A[K][0], A[K][1], A[K][2]>) => (t) => {
      const _t: T.StreamType = (t) as T.StreamType
      switch (_t) {
        case 'updates': return this._acts[k][2]._updates as any
        case 'warn': return this._acts[k][2]._warn
        case 'status': return this._acts[k][2]._status
        default:
          /* istanbul ignore next */
          return _unreachable(_t)
      }
    }

  is = <K extends keyof A> (k: K, s: T.Status): boolean => this._acts[k][1].status === s
  meta = <K extends keyof A> (k: K) => this._acts[k][1] as Readonly<P.Meta<A[K][0], A[K][1], A[K][2]>>
  as = <K extends keyof A, S extends T.Status> (k: K, s: S) =>
    this._acts[k][1].status !== s ?
      _throw(ErrorCode.INCORRECT_CAST)
      : this._acts[k][1] as P.StatusToState<S, A[K][0], A[K][1], A[K][2]>

  fire: <K extends keyof A> (k: K) => P.Fire<A, K>
    = <K extends keyof A> (k: K) => ((ps: A[K][1]) =>
      $.defer(() => {
        // need to defer as the action may be subscribed later - todo: detect such case and warn / add flag
        const [action, meta, metaIn, spec] = this._acts[k]
        if (meta.status === 'in-progress') {
          const sp = spec.inProgressRefire || 'not-allowed'
          switch (sp) {
            case 'not-allowed': return _throw(ErrorCode.FIRE_IN_PROGRESS)
            case 'ignore': return $.empty()
            case 'stop-then-refire': break
            // case 'join': return meta.inProgress
            /* istanbul ignore next */
            default: _unreachable(sp)
          }
        }
        this._resetSingle(k)

        this._acts[k][1] = {
          status: 'in-progress',
          fireWith: ps,
          firedAt: this._ms()
        }
        metaIn._status.next(this._acts[k][1] as any)

        const def = (ps !== undefined ?
          $.defer(() => (action as any)(ps, this._onUpdate(k))) :
          $.defer(() => (action as any)(this._onUpdate(k)))) as Observable<A[K][1]>

        metaIn._inProgress = $.merge(
          spec.warnAfter && // todo: improve
          $.timer(spec.warnAfter)
            .pipe(tap(this._onWarn(k)), filter(() => false)) || $.empty(),
          def
            .pipe(
              (spec.timeout && timeout(spec.timeout)) || (x => x),
              take(1),
              tap(
                this._toDone(k, 'success'),
                this._toDone(k, 'error')
              ),
              takeUntil(
                this._until.pipe(
                  filter(u => u === k)
                )
              ),
              finalize(() => this.is(k, 'in-progress') && this._resetSingle(k)),
              share()
            )
        )
        return metaIn._inProgress
      })) as any // todo: check if could be improved - required to allow 0 params

  reset = <K extends keyof A> (ks?: K | K[]): void =>
    !ks ? this.reset(this.keys) :
      !Array.isArray(ks) ? this.reset([ks]) :
        ks.forEach(this._resetSingle)

  private _resetSingle = <K extends keyof A> (k: K) => {
    this._until.next(k)
    this._acts[k][1] = { status: 'idle' }
    this._acts[k][2]._status.next(this._acts[k][1] as any)
  }

  private _toDone = <K extends keyof A> (k: K, st: 'success' | 'error') => (v?: any) => {
    const n = Object.assign({}, this._acts[k][1], {
      status: st, doneAt: this._ms(), value: v
    })
    if (st === 'error') {
      n.value = undefined
      n.error = v
    }
    this._acts[k][1] = n
    this._acts[k][2]._status.next(n as any)
  }

  private _onUpdate = <K extends keyof A> (k: K) => (u: A[K][2]) => {
    this._acts[k][1] = Object.assign({}, this._acts[k][1], {
      updatedAt: this._ms(), update: u
    })
    this._acts[k][2]._updates.next(this._acts[k][1] as any)
  }

  private _onWarn = <K extends keyof A> (k: K) => () => {
    this._acts[k][1] = Object.assign({}, this._acts[k][1], {
      warnedAt: this._ms()
    })
    this._acts[k][2]._warn.next(this._acts[k][1] as any)
  }
}
