import 'rxjs-compat'

import * as React from 'react'
import * as ReactDom from 'react-dom'

import { Comp } from './KitchenSink'

ReactDom.render(<Comp value='START' />, document.getElementById('root'))
setTimeout(() =>
  ReactDom.render(<Comp value='UPDATED' />, document.getElementById('root')), 5000)
