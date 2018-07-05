import 'rxjs-compat'

import * as React from 'react'
import * as ReactDom from 'react-dom'

import { JSXComp, DOMComp } from './KitchenSink'

DOMComp(document.getElementById('root-dom')!, {})

ReactDom.render(<JSXComp value='START' />, document.getElementById('root-jsx'))
setTimeout(() =>
  ReactDom.render(<JSXComp value='UPDATED' />, document.getElementById('root-jsx')), 5000)
