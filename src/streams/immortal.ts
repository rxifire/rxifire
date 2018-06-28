import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { ImmortalSpec, Immortal, ImmStatus, StatusToImmortal, ImmLoading, ImmError, ImmCompleted } from './immortal.types'
import { _throw, ErrorCode } from '../utils'

import { tap } from 'rxjs/operators/tap'
import { filter } from 'rxjs/operators/filter'
import { switchMap } from 'rxjs/operators/switchMap'
import { share } from 'rxjs/operators/share'
import { repeatWhen } from 'rxjs/operators/repeatWhen'
import { retryWhen } from 'rxjs/operators/retryWhen'

import { merge } from 'rxjs/observable/merge'
import { empty } from 'rxjs/observable/empty'
import { timer } from 'rxjs/observable/timer'

const $ = Observable

export class ImmortalF$<S extends ImmortalSpec, V> {
  public readonly run: Observable<V> // it will never throw nor complete
  _spec: S
  _info!: Immortal
  _$: Subject<Immortal>

  constructor (logic: Observable<V>, spec = {} as S, ms = () => Date.now()) {
    this._spec = spec
    this._$ = new Subject()
    // the meta will be set only after first sub
    // adding additional state seems an overkill
    this._info = {} as any

    const reload = (): void => this._$.next({ status: 'loading', started: ms() } as ImmLoading)
    const warnLongLoad = !spec.longLoad ? empty() : timer(spec.longLoad).pipe(
      tap(() => this._$.next(Object.assign({}, this._info, { longLoad: ms() } as ImmLoading))),
      filter(() => false)) as Observable<never>

    this.run = merge(
      $.defer(() => !spec.shareable && _throw(ErrorCode.EXCLUSIVE_REQUIRED)
        || reload() || empty()), // point of no return
      this._$.pipe(
        tap(m => this._info = m),
        filter(m => m.status === 'loading'),
        switchMap(() =>
          merge(
            warnLongLoad,
            logic.pipe(
              tap(
                () => this._info.status === 'loading' && this._$.next(Object.assign({}, this._info, {
                  status: 'active',
                  loaded: ms()
                })),
                err => this._$.next(Object.assign({}, this._info,
                  { status: 'error', error: err, errorAt: ms(), reload: reload } as ImmError)),
                () => this._$.next(Object.assign({}, this._info,
                  { status: 'completed', completed: ms(), reload: reload } as ImmCompleted
                ))
              )
            )
          )
        ),
        repeatWhen(() => this._$),
        retryWhen(errs => errs.pipe(
          tap((e) => spec.onError && spec.onError(e)),
          switchMap(() => this._$)
        ))
      )
    )

    if (spec.shareable) {
      this.run = this.run.pipe(share())
    }
  }

  is = (s: ImmStatus) => this._info.status === s
  as = <S extends ImmStatus> (s: S) =>
    this._info.status !== s ? _throw(ErrorCode.INCORRECT_CAST) : this._info as StatusToImmortal<S>

  $ = <S extends ImmStatus | undefined> (s?: S): (S extends undefined ? Observable<Immortal> : Observable<StatusToImmortal<NonNullable<S>>>) =>
    (s ? this._$ : this._$.pipe(filter(m => m.status === s))) as any

}
