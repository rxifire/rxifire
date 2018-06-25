
import { Observable } from 'rxjs/Observable'

import { tap } from 'rxjs/operators/tap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { finalize } from 'rxjs/operators/finalize'
import { filter } from 'rxjs/operators/filter'
import { switchMap } from 'rxjs/operators/switchMap'
import { retryWhen } from 'rxjs/operators/retryWhen'
import { defer } from 'rxjs/observable/defer'

import * as P from './types.priv'
import * as T from './types'
import { DateMs } from '../utils/types'

export * from './types'

const $ = Observable

export class ActionsF$<A extends T.AsActionsIO<any>> {
  private _acts: P.Internal<A> = {} as P.Internal<A>
  private _cache: { [K in keyof A]?: A[K][1] } = {}
  private _ms: () => DateMs

  constructor (actions: T.Actions<A>, spec: T.ActionsSpec<A> = {}, timeMs = () => Date.now()) {
    this._ms = timeMs
    this._acts = Object.keys(actions)
      .reduce((acc, k) => {
        acc[k] = [(actions[k] as any), { status: 'idle' }, spec[k]]
        return acc
      }, {} as P.Internal<A>)
  }

  meta = <K extends keyof A>(k: K) => this._acts[k][1]
  is = <K extends keyof A>(k: K, s: T.Status): boolean => this._acts[k][1].status === s

  fire = <K extends keyof A>(k: K) => (ps: A[K][0]) => {
    const [action, meta, spec] = this._acts[k]
    return $.defer(() => action(ps))
  }
}
