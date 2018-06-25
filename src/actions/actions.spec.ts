import 'rxjs-compat'
import { Observable as $ } from 'rxjs/Observable'

import { ActionsF$, ActionsIO, ActionsSpec, Actions } from './index'

interface IO extends ActionsIO {
  prom: [number, string, null],
  obs: [string, string[], null],
  never: [never, never, null]
}

const acts: Actions<IO> = {
  prom: (n) => Promise.resolve(`${n}`),
  obs: (s) => $.of(s.split('')).delay(1),
  never: () => $.never()
}

const spec: ActionsSpec<IO> = {
  never: {
    warnAfter: 2, timeout: 4
  }
}

let ctr: ActionsF$<IO>

beforeEach(() => ctr = new ActionsF$(acts, spec))

test('actions - simple', () => {
  ctr.fire('')
})
