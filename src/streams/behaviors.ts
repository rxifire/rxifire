import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import { AsCallbacks, AsBehaviors, AsObservables } from '../utils/types'

import { SignalsF$ } from './signals'

export class BehaviorsF$<S extends {}> extends SignalsF$<S> {
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

  $s = <K extends keyof S> (ks?: K[]): never extends K ? AsObservables<S> : Pick<AsObservables<S>, K> =>
    this._$ as any

  update = <K extends keyof S> (k: K) => (up: (v: S[K]) => S[K]): void =>
    this._$[k].next(up(this._$[k].value))

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
