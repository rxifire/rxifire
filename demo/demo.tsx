import 'rxjs-compat'
import * as Rx from 'rxjs'

import * as React from 'react'
import * as ReactDom from 'react-dom'

import App from './App'

Rx.Observable.timer(0, 1000)
  .do((c) =>
    ReactDom.render(<App name='App' count={c} />, document.getElementById('root'))
  ).subscribe()