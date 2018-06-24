import * as F$ from '../../src'
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

export type State = {
  name: string
  pos: Pos
}

export const spec: F$.ComponentSpec<State, Signals, Behaviors> = {
  behaviorDefaults: {
    name: '', dob: undefined as DoB | undefined
  }
}

const log: F$.Logic<typeof spec> = ({ beh, sig }) => {
  beh.$('dob')
  sig.$('click')
  return Observable.of({ name: 'ab', pos: { x: 0, y: 0 } })
}
