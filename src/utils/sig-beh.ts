import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { _throw, ErrorCode } from './errors'

import { AsSubjects, AsCallbacks, AsBehaviors, AsObservables } from './types'

// todo: consider option of async firing / definition which fires should run on animation thread
// todo: once landed in TS adjust to variadic params https://github.com/Microsoft/TypeScript/pull/24897

export type EmitType<K, T> =
  K extends null ? () => void :
  T extends undefined ? (v: K) => void :
  (v: T) => void

export class SignalsFire<S extends {}> {
  protected _cb: AsCallbacks<S> = {} as any
  protected _$: AsSubjects<S> = {} as any
  private _cache = {} as any

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
      // todo: this is not ideal - one better option could be force cache name
      // todo: count number of caches and throw if too many + option too ignore / set limit
      const key = `${k}__${map.name || map.toString()}`
      cb = this._cache[key]
      if (!cb) {
        cb = this._cache[key] = (v: T) => (this._cb as any)[k](map(v))
      }
    }
    return cb
  }

  private _add = <K extends keyof S> (k: K) => {
    this._$[k] = new Subject();
    (this._cb as any)[k] = (p: any) => this._$[k].next(p) as any
    return this._$[k]
  }
}

export class BehaviorsFire<S extends {}> extends SignalsFire<S> {
  v: <K extends keyof S> (k: K) => S[K]
  vs: <K extends keyof S> (ks?: K[]) => Pick<S, K>

  protected _$: AsBehaviors<S> = {} as any
  protected _cb: AsCallbacks<S> = {} as any
  private _spec: S

  constructor (spec: S) {
    super()
    this._spec = spec
    Object.keys(spec)
      .forEach(k => {
        (this._$ as any)[k] = new BehaviorSubject<any>((spec as any)[k]);
        (this._cb as any)[k] = (p: any) => (this._$ as any)[k].next(p)
      })

    this.v = this.value
    this.vs = this.values
  }

  // we know
  $s = <K extends keyof S> (ks?: K[]): never extends K ? AsObservables<S> : Pick<AsObservables<S>, K> =>
    this._$ as any

  value = <K extends keyof S> (k: K): S[K] => this._$[k].value

  values = <K extends keyof S> (ks?: K[]): never extends K ? S : Pick<S, K> =>
    ks ? ks.reduce((acc, k) => {
      (acc as any)[k] = this._$[k].value
      return acc
    }, {} as Pick<S, K>) : (this as any).values(Object.keys(this._spec))

  reset = <K extends keyof S> (ks?: K | K[]): void =>
    !ks ? this.reset(Object.keys(this._$) as K[]) :
      !Array.isArray(ks) ? this.reset([ks]) :
        ks.forEach(k => this._$[k].next(this._spec[k]))
}
