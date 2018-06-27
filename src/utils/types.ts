import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

type UniqueType = { __RXIFIRE__: 'unique-token' }
// todo: add other fields - link to docs
export type TypeError<Msg extends String, Ctx = UniqueType> = {
  F$_TYPE_ERROR: Msg
} & (Ctx extends UniqueType ? {} : { context: Ctx })

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
  P extends (null | undefined | void | never) ? () => R : (p: P) => R

// todo: make them pseudo opaque
export type Seconds = number
export type Milliseconds = number

export type DateMs = Milliseconds
