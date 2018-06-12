import * as React from 'react'

import { View } from './props.types'

export const view: View = (c) => (s, e) =>
  <div>
    The problem it solves: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11640
    <pre>
      {JSON.stringify(s, null, 4)}
    </pre>
  </div>
