
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

export * from './types'

const $ = Observable

type Internal<A extends T.AsActionsIO<any>> = {
  [K in keyof A]: [P.ActionsIn<A>[K], T.ActionsSpec<A>[K]]
}

export class ActionsF$<A extends T.AsActionsIO<any>> {
  private _acts: Internal<A> = {} as Internal<A>
  private _cache: { [K in keyof A]?: A[K][1] } = {}

  constructor (actions: T.Actions<A>, spec: T.ActionsSpec<A> = {}) {
    this._acts = Object.keys(actions)
      .reduce((acc, k) => {
        acc[k] = [(actions[k] as any), spec[k]]
        return acc
      }, {} as Internal<A>)
  }

  fire = <K extends keyof A>(k: K) => (ps: A[K][0]) => {
    const [action, spec] = this._acts[k]
    return $.defer(() => action(ps))
  }
}
