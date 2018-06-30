import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

export type Void = null | undefined | void | never

export type AsObservables<T extends {}> = {
  [k in keyof T]: Observable<T[k]>
}

export type AsSubjects<T extends {}> = {
  [k in keyof T]: Subject<T[k]>
}

export type AsBehaviors<T extends {}> = {
  [k in keyof T]: BehaviorSubject<T[k]>
}

export type AsCallbacks<T extends {}> = {
  [k in keyof T]: T[k] extends null ? () => void : (k: T[k]) => void
}

export type FnParams<P, R> =
  P extends Void ? () => R : (p: P) => R

// todo: make them pseudo opaque + cast methods
export type Count = number

export type Seconds = number
export type Milliseconds = number
export type DateMs = Milliseconds
