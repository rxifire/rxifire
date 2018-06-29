import { ErrorCode, _throw } from '../utils'

type Interfaces<T extends {} = any> = { [K in keyof T]: any }

export type PolySpec<T extends TransitionsProto<T>> = {
  transitions: T
  initial: (keyof T)

  interfaces?: any

  down?: {
    [K in keyof T]?: T[K] extends TransitionsProto<T[K]> ? PolySpec<T[K]> : never
  }
}

// TODO: TransitionsProto<TransitionsCheck<T>> is not ideal
// - wrongly defined transitions will be of type `never`
// ideally TS would show error on wrongly defined transitions
// maybe something with `infer` could achieve this goal
// additionally there could be auxiliary check-type
export class PolyF$<T extends TransitionsProto<T>> {
  _spec: PolySpec<T>
  _current: keyof T
  _states: (keyof T)[]

  constructor (spec: PolySpec<T>) {
    this._spec = spec
    this._states = Object.keys(spec.transitions)
    this._current = spec.initial
  }

  is = <F extends keyof T> (s: F) => s !== this._current ? _throw(ErrorCode.INCORRECT_CAST) : true

  from = <F extends keyof T> (s: F) => (to: Transitions<T>[F]) =>
    s !== this._current ? _throw(ErrorCode.INCORRECT_CAST) : (this._current = to)

  down = <F extends keyof T> (s: F): (NonNullable<PolySpec<T>['down']>[F] extends PolyF$<infer U> | undefined ? PolyF$<U> : undefined) =>
    this._spec.down && this._spec.down[s] as any
}

type TransitionsProto<T> = { [K in keyof T]: { [P in keyof T[K]]: boolean } }

type Transitions<T extends { [K in keyof T]: { [P in keyof T[K]]: boolean } },
  K extends keyof T | string = keyof T> = {
    [P in keyof T]: keyof T[P] extends K ? keyof T[P] : void
  }

type TransitionsCheck<T extends { [K in keyof T]: { [P in keyof T[K]]: boolean } }> = {
  [P in keyof T]: keyof T[P] extends keyof T ? T[P] : never
}
