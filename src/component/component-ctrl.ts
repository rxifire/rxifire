import { map, tap } from '../utils'
import { SignalsF$, BehaviorsF$, ImmortalF$ } from '../streams'
import { Logic, ComponentSpec } from './types'

type Config = {
  ext: any,
  spec: ComponentSpec<any, any, any, any, any, any>, logic: Logic<any>, view: (ps: any) => (s: any) => any
}

export const ctrl = (c: Config) => {
  const beh = c.spec.behaviorsDefaults && new BehaviorsF$(c.spec.behaviorsDefaults)
  const ani = c.spec.animate && new BehaviorsF$(c.spec.animate)
  const sig = new SignalsF$()
  const tsk = c.spec.tasks

  const log = new ImmortalF$(c.logic({ beh, sig, tsk, ...(c.ext) }))
  const v = c.view({ beh, sig, meta: log, tsk: c.spec.tasks, ani })

  const streams = [beh && beh.changed, tsk && tsk.$s()].filter(Boolean)

  if (ani) {
    const ks = Object.keys(c.spec.animate!)
    const bs = beh!.$s(ks as any)
    ks.forEach(k =>
      streams.push((bs as any)[k]
        .pipe(
          (c.spec.animate![k]),
          tap(v => (ani as any).fire(k)(v)))
      ))
  }

  return [log.run, v, streams]

}
