import 'rxjs-compat'
import * as Rx from 'rxjs'
import * as React from 'react'

const root = document.getElementById('root')

Rx.Observable.timer(0, 1000)
  .do(i => root!.innerHTML = `and counting ${i}`)
  .subscribe()