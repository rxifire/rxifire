import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { _throw, ErrorCode } from './errors'

import { AsSubjects, AsCallbacks, AsBehaviors, AsObservables } from './types'

export interface EmitOptions<V, T> {
  // cacheName?: string
  noThrow?: boolean
  map?: (v: T) => V
}

export type EmitType<K, T> =
  K extends null ?
    () => void :
    T extends undefined ?
    (v: K) => void :
    (v: T) => void

export class SignalWrap<S extends {}> {
  private _cb: AsCallbacks<S> = {} as any
  private _$: AsSubjects<S> = {} as any

  $ = <K extends keyof S> (k: K): Observable<S[K]> =>
    (this._$[k] || this._add(k))

  // we force to always pass names as otherwise they would need to be specified in constructor
  // and it adds unnecessary boilerplate (info duplicated in type and value due to TS limitations)
  $s = <K extends keyof S> (ks: K[]): Pick<AsObservables<S>, K> =>
    ks.reduce((acc, k) => {
      (acc as any)[k] = this._$[k] || this._add(k)
      return acc
    }, {} as Pick<AsObservables<S>, K>)

  fire = <K extends keyof S, T = undefined> (k: K, map?: (v: T) => S[K]): EmitType<S[K], T> => {
    let cb: any = this._cb[k] || _throw(ErrorCode.SIGNAL_TO_VOID)
    if (map) {
      cb = (v: T) => (this._cb as any)[k](map(v))
    }
    return cb
  }

  private _add = <K extends keyof S> (k: K) => {
    this._$[k] = new Subject();
    (this._cb as any)[k] = (p: any) => this._$[k].next(p) as any
    return this._$[k]
  }
}

export class BehaviorsWrap<S extends {}> {
  private _$: AsBehaviors<S> = {} as any
  private _cb: AsCallbacks<S> = {} as any

  constructor (s: S) {
    Object.keys(s)
      .forEach(k => {
        (this._$ as any)[k] = new BehaviorSubject<any>((s as any)[k]);
        (this._cb as any)[k] = (p: any) => (this._$ as any)[k].next(p)
      })
  }

  $ = <K extends keyof S> (k: K | K[]): Observable<S[K]> =>
    Array.isArray(k) ? Observable.from(k).mergeMap(key => this._$[key]) : this._$[k]

  cb = <K extends keyof S> (k: K): ((p: S[K]) => void) => this._cb[k]

}
