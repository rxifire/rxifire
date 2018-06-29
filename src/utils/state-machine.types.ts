import { Void } from './types'

export type TransitionsProto<T> = {
    [K in keyof T]: T[K] extends {} ?
    (keyof T[K] extends keyof T ?
      ({ [KK in keyof T[K]]: T[K][KK] extends boolean ? T[K][KK] : never }) : never)
    : never
  }

export type Deeper<T extends {}> = {
  [K in keyof T]?: T[K] extends MachineF$<any> ? T[K] : {}
}

class MachineF$<T extends TransitionsProto<T>, D extends Deeper<T> = {}> {
  private _transitions: T
  private _deeper: D

  constructor (transitions: T, deeper = {} as D) {
    this._transitions = transitions
    this._deeper = deeper
  }

  deep = <S extends keyof T> (s: S) =>
    this._deeper[s] as D[S] extends MachineF$<any> ? D[S] : undefined
}

const T = true
const tr = { a: { a: T, b: T }, b: { a: T, b: T } }
const aTr = { c: { d: T }, d: { c: T } }

const m = new MachineF$(tr, { a: new MachineF$(aTr) })

const de = m.deep('a').deep('c')

type Ks = keyof typeof tr
type Tr = TransitionsProto<typeof tr>

type A = null extends {} ? true : false
type B = keyof null
type N = keyof null extends never ? true : false
type N1 = keyof null extends 'A' ? true : false

type E = 'a' | 'b' extends 'a' ? true : false
