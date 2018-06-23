export enum ErrorCode {
  SIGNAL_TO_VOID = 4000
}

export type EnumMap = {
  [P in ErrorCode]: string
}

const StatusToMessage: EnumMap = {
  4000: 'If a tree falls in the forest and no one is there, does it still make a sound.'
}

export class RxifireError extends Error {
  status: ErrorCode
  context?: object

  constructor (status: ErrorCode, context?: object) {
    super(StatusToMessage[status])
    this.name = `${ErrorCode[status]} - ${status}`
    this.status = status
    this.context = context
  }

  toJSON (short = false) {
    return JSON.stringify({
      status: this.status,
      name: this.name,
      message: this.message,
      context: this.context,
      stack: this.stack
    }, null, short ? 0 : 4)
  }
}

export const _throw = (status: ErrorCode, context?: object) => {
  throw new RxifireError(status, context)
}
