import * as Fx from '../../src'
import { Observable } from 'rxjs'

export type DoB = { day: number, month: number, year: number }
export type Pos = { x: number, y: number }

export type Signals = {
  click: never
  pos: Pos
}

export type Behaviors = {
  name: string, dob: DoB | undefined
}

export const spec: Fx.ComponentSpec<Behaviors> = {
  behaviorDefaults: {
    name: '', dob: undefined as DoB | undefined
  }
}

export type State = {
  name: string
  pos: Pos
}

const log: Fx.Logic = ({ beh }: Fx.LogicParams<typeof spec, Signals>) => {
  beh.$('dob')
  return Observable.of('')
}
