import * as P from './tasks.priv'
import * as T from './types'

import {
  _throw, ErrorCode, _unreachable, DateMs,
  $, Observable, Subject, tap, takeUntil, finalize, filter, share, timeout, take, merge, map
} from '../utils'

export class TasksF$<A extends T.AsTasksIO<any>> {
  private static readonly _empty = {}
  public readonly updates: Observable<[keyof A, P.InProgress<any, any, P.NoOp>]>
  public readonly warns: Observable<[keyof A, P.InProgress<any, any, P.WarnToken>]>
  public readonly statuses: Observable<[keyof A, T.StatusEvent<any, any>]>
  public readonly keys: (keyof A)[]
  private _acts: P.Internal<A> = {} as P.Internal<A>
  // private _cache: { [K in keyof A]?: A[K][1] } = {}
  private _ms: () => DateMs
  private _until = new Subject<keyof A>()

  private _updates = new Subject<[keyof A, P.InProgress<any, any, P.NoOp>]>()
  private _warns = new Subject<[keyof A, P.InProgress<any, any, P.WarnToken>]>()
  private _statuses = new Subject<[keyof A, T.StatusEvent<any, any>]>()

  constructor (actions: T.AsTasks<A>, spec: T.TasksSpec<A> = {}, timeMs = () => Date.now()) {
    this._ms = timeMs
    this.keys = Object.keys(actions)
    this.updates = this._updates.asObservable()
    this.warns = this._warns.asObservable()
    this.statuses = this._statuses.asObservable()
    this._acts = this.keys
      .reduce((acc, k) => {
        acc[k] = [
          (actions[k] as any), { status: 'idle' },
          { },
          spec[k] as any || TasksF$._empty
        ]
        return acc
      }, {} as P.Internal<A>)
  }

  $ = <K extends keyof A> (k: K): (<T extends P.AvailableStreams<A[K][2]>>(t?: T) =>
    P.StreamTypeToEvents<T, A[K][0], A[K][1], A[K][2]>) => (t) => {
      const _t = t as T.StreamType || 'status'
      switch (_t) {
        case 'updates': return this._updates.pipe(filter(x => x[0] === k), map(x => x[1]))
        case 'warn': return this._warns.pipe(filter(x => x[0] === k), map(x => x[1]))
        case 'status': return this._statuses.pipe(filter(x => x[0] === k), map(x => x[1])) as any
        default:
          /* istanbul ignore next */
          return _unreachable(_t)
      }
    }
  $s = () => merge(this._updates, this._warns, this._statuses)

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
            case 'not-allowed': return _throw(ErrorCode.EXCLUSIVE_REQUIRED)
            case 'ignore': return $.empty()
            case 'stop-then-refire': break
            // case 'join': return meta.inProgress
            /* istanbul ignore next */
            default: _unreachable(sp)
          }
        }

        if (meta.status !== 'idle') {
          this._resetSingle(k)
        }

        this._acts[k][1] = {
          status: 'in-progress',
          fireWith: ps,
          firedAt: this._ms()
        }
        this._statuses.next([k, this._acts[k][1] as T.StatusEvent<any, any>])

        const def = (ps !== undefined ?
          $.defer(() => (action as any)(ps, this._onUpdate(k))) :
          $.defer(() => (action as any)(this._onUpdate(k)))) as Observable<A[K][1]>

        metaIn._inProgress = $.merge(
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
            ),
          spec.warnAfter && // todo: improve
          $.timer(spec.warnAfter)
            .pipe(tap(this._onWarn(k)), filter(() => false)) || $.empty()
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
    this._statuses.next([k, this._acts[k][1] as T.StatusEvent<any, any>])
  }

  private _toDone = <K extends keyof A> (k: K, st: 'success' | 'error') => (v?: any) => {
    const n = Object.assign(
      st === 'error' ? { error: v } : { value: v },
      this._acts[k][1],
      {
        status: st, doneAt: this._ms(), value: v
      })

    this._acts[k][1] = n
    this._statuses.next([k, n as T.StatusEvent<any, any>])
  }

  private _onUpdate = <K extends keyof A> (k: K) => (u: A[K][2]) => {
    this._acts[k][1] = Object.assign({}, this._acts[k][1], {
      updatedAt: this._ms(), update: u
    })
    this._updates.next([k, this._acts[k][1] as P.InProgress<any, any, P.NoOp>])
  }

  private _onWarn = <K extends keyof A> (k: K) => () => {
    this._acts[k][1] = Object.assign({}, this._acts[k][1], {
      warnedAt: this._ms()
    })
    this._updates.next([k, this._acts[k][1] as P.InProgress<any, any, P.WarnToken>])
  }
}
