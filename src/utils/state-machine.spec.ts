import { MachineF$, Transitions, Y } from './state-machine'

const trans = {
  This: Y,
  is: { This: Y, 'crazy!': Y },
  'crazy!': { This: Y, D: Y },
  D: {}
}

const m1 = new MachineF$(trans)
const m2 = new MachineF$(trans, { This: m1, is: m1, 'crazy!': m1 })
const m3 = new MachineF$(trans, { This: m2, is: m2, 'crazy!': m2 })
const root = new MachineF$(trans, { This: m3, is: m3, 'crazy!': m3 })

test('deeper', () => expect(root.sel('This').sel('is').sel('crazy!')).toBe(m1))
