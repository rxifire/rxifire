import 'rxjs-compat'
import { Observable as $ } from 'rxjs'
import { ImmortalF$ } from './immortal'
import { RxifireError } from '../utils'

test('immortal - simple', () =>
  $.of(new ImmortalF$($.of(1), {}))
    .mergeMap(imm =>
      imm.run.takeUntil(
        imm.$().take(3).map(s => s.status).toArray()
          .map(st => expect(st).toEqual(['loading', 'active', 'completed']))
      )).toPromise())

test('immortal - incorrect cast', () =>
  $.of(new ImmortalF$($.of(1), {}))
    .mergeMap(imm =>
      imm.run.takeUntil(
        imm.$().map(() => imm.is('loading') && imm.as('completed'))
      ))
    .toPromise()
    .catch(err => expect(err).toBeInstanceOf(RxifireError)))

test('immortal - reload from completed', () =>
  $.of(new ImmortalF$($.of(1, 'a'), {}))
    .mergeMap(imm =>
      imm.run.takeUntil(
        imm.$('completed').take(2).do(s => s.reload())
      ))
    .toArray()
    .do(v => expect(v).toEqual([1, 'a', 1, 'a', 1, 'a']))
    .toPromise())

test('immortal - reload from error', () =>
  $.of(new ImmortalF$($.of(1, 'a').merge($.throw('ERR')), {}))
    .mergeMap(imm =>
      imm.run.takeUntil(
        imm.$('error').take(2).do(s => expect(s.error).toBe('ERR')).do(s => s.reload())
      ))
    .toArray()
    .do(v => expect(v).toEqual([1, 'a', 1, 'a', 1, 'a']))
    .toPromise())

test('immortal - reload from error', () =>
  $.of(new ImmortalF$($.of(1, 'a').merge($.throw('ERR')),
    { onError: (err) => expect(err).toBe('ERR') }))
    .mergeMap(imm =>
      imm.run.takeUntil(
        imm.$('error').take(2).do(s => expect(s.error).toBe('ERR')).do(s => s.reload())
      ))
    .toArray()
    .do(v => expect(v).toEqual([1, 'a', 1, 'a', 1, 'a']))
    .toPromise())

test('immortal - long-load - never', () =>
  $.of(new ImmortalF$($.never(), { longLoad: 2 }))
    .mergeMap(imm =>
      imm.run.takeUntil(
        imm.$('loading').take(2).map(s => !!s.longLoad).toArray()
          .do(s => expect(s).toEqual([false, true]))
      ))
    .toArray()
    .toPromise())

test('immortal - long-load (values + cast)', () =>
  $.of(new ImmortalF$($.timer(5, 1).mapTo('A'), { longLoad: 2 }))
    .mergeMap(imm =>
      imm.run.take(3)
        .do(x => expect(x).toBe('A'))
        .merge(
          imm.$('loading').take(2).map(() => !!imm.as('loading').longLoad).toArray()
            .do(s => expect(s).toEqual([false, true]))
        ))
    .toArray()
    .toPromise())

test('immortal - re-run throws', () =>
  $.of(new ImmortalF$($.never()))
    .mergeMap(imm =>
      imm.run.merge(imm.run))
    .toPromise()
    .catch(err => expect(err).toBeInstanceOf(RxifireError)))

test('immortal - re-run shareable ok', () =>
  $.of(new ImmortalF$($.timer(1).mapTo({}), { shareable: true }))
    .mergeMap(imm =>
      imm.run.zip(imm.run).take(1)
        .do(x => expect(x[0]).toBe(x[1]))
    )
    .toPromise())
