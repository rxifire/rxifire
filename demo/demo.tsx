import 'rxjs-compat'
import * as Rx from 'rxjs'

import * as React from 'react'
import * as ReactDom from 'react-dom'

import App from './App'

ReactDom.render(<App name='App' count={0} />, document.getElementById('root'))
