import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

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
  [k in keyof T]: T[k] extends never ? () => void : (k: T[k]) => void
}
