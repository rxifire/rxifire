export type TransitionsProto<T extends {}> =
  {} extends T ?
  {} :
  {
    [K in keyof T]: T[K] extends {} ?
    (keyof T[K] extends keyof T ?
      ({ [KK in keyof T[K]]: KK extends boolean ? T[K][KK] : never }) : never)
    : never
  }

const T = true
const tr = { a: { a: T } }

type Ks = keyof typeof tr
type Tr = TransitionsProto<typeof tr>

type A = null extends {} ? true : false
type B = keyof null
type N = keyof null extends never ? true : false
type N1 = keyof null extends 'A' ? true : false

type E = 'a' | 'b' extends 'a' ? true : false
