
export type Y = 'Y'
export const Y = 'Y' as Y
type __INCORRECT__<S extends string> = { __INCORRECT__: S }
export type Transitions<T extends object> = {
  [K in keyof T]:
  T[K] extends Y ? { [KK in keyof T]: Y } | Y :
  (T[K] extends object ?
    (keyof T[K] extends keyof T ?
      ({ [KK in keyof T[K]]: T[K][KK] extends Y ? T[K][KK] : __INCORRECT__<'Mark allowed with Y'> }) :
      __INCORRECT__<'Only top level keys or \'Y\' for all'>) : __INCORRECT__<'Map expected - {} for no transitions.'>)
}

export type Level<T extends {}> = {
  [K in keyof T]?: T[K] extends MachineF$<any> ? T[K] : {}
}

export type LevelOrSpec<T extends object> = {
  [K in keyof T]?: T[K] extends object ?
  (T[K] extends MachineF$<any> ? T[K] :
  (T[K] extends Transitions<T[K]> ? T[K] : never))
  : never
}

export type LevelOrSpecToLevel<T extends object> = {
  [K in keyof T]?: T[K] extends MachineF$<any> ? T[K] :
  T[K] extends Transitions<any> ? MachineF$<T[K]> : {}
}

export class MachineF$<T extends Transitions<any>, D extends LevelOrSpec<T> = {}> {
  // private _subs!: Level<T>

  constructor (private transitions: T, private subs = {} as D) { }

  sel = <S extends keyof T> (s: S) =>
    this.subs[s] as D[S] extends MachineF$<any> ? D[S] : undefined
}
