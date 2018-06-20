import * as Rx from 'rxjs'

import { Logic, UIState } from './say-color.types'

const $ = Rx.Observable

// https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

const colors = ['black', 'blue', 'brown', 'gray', 'green', 'lime', 'magenta', 'olive', 'orange', 'pink', 'purple', 'red', 'silver', 'yellow']

const grammar = `#JSGF V1.0; grammar colors: public <color> = ${colors.join(' | ')} ;`

const randInt = (min: number, max: number) => min + Math.floor((max - min) * Math.random())

const randPair = <T> (arr: T[]): [T, T] => {
  const r = [arr[randInt(0, arr.length)], arr[randInt(0, arr.length)]] as [T, T]
  return r[0] === r[1] ? randPair(arr) : r
}

const recognizeSpeech = (grammar: string) =>
  $.create((obs: Rx.Observer<string>) => {
    const recognition = new (window as any).webkitSpeechRecognition()
    const speechRecognitionList = new (window as any).webkitSpeechGrammarList()
    speechRecognitionList.addFromString(grammar, 1)
    recognition.grammars = speechRecognitionList
    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (ev: any) => {
      let c = ev.results[0][0].transcript
      obs.next(c)
    }

    recognition.start()

    return () => recognition.abort()
  }) as Rx.Observable<string>

const handleGame = (duration: number, hits: number): Rx.Observable<UIState> =>
  duration === 3 ?
    $.empty() : // win
    $.concat(
      $.defer(() => $.of(randPair(colors)))
        .do(x => console.log('NEXT-PAIR', x))
        .mergeMap(([text, color]) =>
          $.of({
            state: 'in',
            text,
            color
          } as UIState)
            .merge(
              recognizeSpeech(grammar)
                .map(r => r.toLowerCase())
                .filter(r => r === color)
                .take(1)
                .do(() => console.log('HIT'))
                .ignoreElements()
            )
            .timeout(duration * 1000 + 500) // 500 ms some lag till results are present
        )
        .repeat(hits),
        handleGame(duration - 1, hits + 1) // increasing diff.
    )

export const logic: Logic = ({ uiEvents }) =>
  uiEvents.start.startWith(true)
    .switchMapTo(handleGame(5, 3))
    .startWith({
      state: 'before'
    } as UIState)
