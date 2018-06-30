import { Observable } from 'rxjs/Observable'
import { AsActions, AsActionsIO, ActionsF$, ActionsSpec } from '../src/actions'
import { DateMs, Milliseconds, Count } from '../src'

const $ = Observable

type ActionsIO = AsActionsIO<{
  randomNumber: [never, number, null],
  randomNumbers: [number, number[], number],
  error: [null, never, number]
}>

type Config = {
  currentTime: () => DateMs
  tickLength: Milliseconds
}

export type Actions = AsActions<ActionsIO>

const tick = (tick: Milliseconds) => (ticks: Count) => tick * ticks

const withDefault = (c?: Partial<Config>) => ({
  currentTime: () => Date.now(),
  tickLength: 200,
  ...c
} as Config)

export const someActions = (cfg?: Partial<Config>, spec?: ActionsSpec<ActionsIO>) => {
  const c = withDefault(cfg)
  const t = tick(c.tickLength)
  const actions: Actions = {
    randomNumber: () => $.timer(t(1)).mapTo(Math.random()),
    randomNumbers: (n, onUpdate) => $.timer(t(1), t(1))
      .take(n)
      .do((i) => onUpdate((i + 1) / n))
      .map(() => Math.random())
      .toArray(),
    error: (onUpdate) => $.timer(t(1), t(1))
      .take(5)
      .do((i) => onUpdate((i + 1) / 5))
      .last()
      .mergeMapTo($.throw('ERROR'))
  }
  return new ActionsF$(actions, spec, c.currentTime)
}
