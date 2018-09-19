import 'rxjs-compat'

import * as React from 'react'
import * as ReactDom from 'react-dom'

import { JSXComp, DOMComp } from './KitchenSink'
import { render, html } from 'lit-html'

DOMComp(document.getElementById('root-dom')!, {})
setTimeout(() => render(html`<h1>D</h1>`, document.getElementById('root-dom')!), 2000)

ReactDom.render(<JSXComp value='START' />, document.getElementById('root-jsx'))
setTimeout(() =>
  ReactDom.render(<JSXComp value='UPDATED' />, document.getElementById('root-jsx')), 5000)
