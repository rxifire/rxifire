
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { tap } from 'rxjs/operators/tap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { finalize } from 'rxjs/operators/finalize'
import { filter } from 'rxjs/operators/filter'
import { share } from 'rxjs/operators/share'
import { timeout } from 'rxjs/operators/timeout'

import * as P from './types.priv'
import * as T from './types'
import { DateMs } from '../utils/types'
import { _throw, ErrorCode, _unreachable } from '../utils/errors'

export * from './types'

const $ = Observable

export class ActionsF$<A extends T.AsActionsIO<any>> {
  public readonly keys: (keyof A)[]
  private _acts: P.Internal<A> = {} as P.Internal<A>
  private _cache: { [K in keyof A]?: A[K][1] } = {}
  private _ms: () => DateMs
  private _until = new Subject<keyof A>()

  constructor (actions: T.Actions<A>, spec: T.ActionsSpec<A> = {}, timeMs = () => Date.now()) {
    this._ms = timeMs
    this.keys = Object.keys(actions)
    this._acts = this.keys
      .reduce((acc, k) => {
        acc[k] = [(actions[k] as any), { status: 'idle' }, spec[k]]
        return acc
      }, {} as P.Internal<A>)
  }

  is = <K extends keyof A> (k: K, s: T.Status): boolean => this._acts[k][1].status === s
  meta = <K extends keyof A> (k: K) => this._acts[k][1] as Readonly<P.Meta<A[K][1], A[K][2]>>
  as = <K extends keyof A, S extends T.Status> (k: K, s: S) =>
    this._acts[k][1].status !== s ?
      _throw(ErrorCode.INCORRECT_CAST)
      : this._acts[k][1] as P.StatusToState<S, A[K][1], A[K][2]>

  fire = <K extends keyof A> (k: K) => (ps: A[K][0]) =>
    $.defer(() => {
      // need to defer as the action may be subscribed later - todo: detect such case and warn / add flag

      const [action, meta, spec] = this._acts[k]
      if (meta.status === 'in-progress') {
        const sp = (spec && spec.inProgressRefire) || 'not-allowed'
        switch (sp) {
          case 'not-allowed': return _throw(ErrorCode.FIRE_IN_PROGRESS)
          case 'ignore': return $.empty()
          case 'stop-then-refire': break
          case 'join':
            if (meta.inProgress) return meta.inProgress
            break
          default: _unreachable(sp)
        }
      }
      this._resetSingle(k)

      meta.firedAt = this._ms()
      meta.updates = []

      meta.inProgress = $.defer(() => action(ps))
        .pipe(
          spec && spec.timeout && timeout(spec.timeout) as any,
          tap(
            v => { // todo: updates
              meta.status = 'success'
              meta.doneAt = this._ms()
              meta.value = v
            },
            e => {
              meta.status = 'error'
              meta.doneAt = this._ms()
              meta.error = e
            }
          ),
          takeUntil(
            this._until.pipe(
              filter(u => u === k)
            )
          ),
          finalize(() => this.is(k, 'in-progress') && this._resetSingle(k)),
          share()
        )
      return meta.inProgress
    })

  reset = <K extends keyof A> (ks?: K | K[]): void =>
    !ks ? this.reset(this.keys) :
      !Array.isArray(ks) ? this.reset([ks]) :
        ks.forEach(this._resetSingle)

  private _resetSingle = <K extends keyof A> (k: K) => {
    this._until.next(k)
    const m = this._acts[k][1]
    Object.keys(m).forEach(mk => delete m[mk])
    m.status = 'idle'
  }
}
