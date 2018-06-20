import { Logic } from './counter.types'

export const logic: Logic = ({ uiEvents }) =>
  uiEvents.next
    .scan((acc, s) => acc + s, 0)
    .startWith(0)
    .map(c => ({ counter: c }))
