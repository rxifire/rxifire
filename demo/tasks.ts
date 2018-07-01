import { AsTasks, AsTasksIO, TasksF$, TasksSpec } from '../src/tasks'
import { DateMs, Milliseconds, Count } from '../src'
import { $ } from '../src/utils'

export type ActionsIO = AsTasksIO<{
  randomNumber: [never, number, null],
  randomNumbers: [number, number[], number],
  error: [null, never, number]
}>

type Config = {
  currentTime: () => DateMs
  tickLength: Milliseconds
}

export type Tasks = AsTasks<ActionsIO>

const tick = (tick: Milliseconds) => (ticks: Count) => tick * ticks

const withDefault = (c?: Partial<Config>) => ({
  currentTime: () => Date.now(),
  tickLength: 200,
  ...c
} as Config)

export const fakeTasks = (cfg?: Partial<Config>, spec?: TasksSpec<ActionsIO>) => {
  const c = withDefault(cfg)
  const t = tick(c.tickLength)
  const tasks: Tasks = {
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
  return new TasksF$(tasks, spec, c.currentTime)
}
