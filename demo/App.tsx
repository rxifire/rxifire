import * as React from 'react'
import * as Rx from 'rxjs'

import { rxComponent, Logic, View } from '../src'

const $ = Rx.Observable

export interface Props {
  name: string
  count: number
}

export interface UIEvents {
  click: any
}

export const logic: Logic<Props, UIEvents> = ({ props, uiEvents }) =>
  $.merge(
    props,
    uiEvents['click']
      .do(x => console.log(x))
      .ignoreElements()
  )

export const view: View<UIEvents, Props> = (cb) => (ps) =>
  <div onClick={cb.click}>
    <h1>Cool, {ps.name} {ps.count}</h1>
  </div>

export default rxComponent<Props, UIEvents>(logic, view, {
  uiEventsNames: ['click']
})
