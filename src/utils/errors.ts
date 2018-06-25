// todo make sense out of it
export enum ErrorCode {
  SIGNAL_TO_VOID = 4000,
  INCORRECT_CAST = 4010,
  FIRE_IN_PROGRESS = 4100,

  UNREACHABLE = 5000
}

export type EnumMap = {
  [P in ErrorCode]: string
}

const StatusToMessage: EnumMap = {
  4000: 'If a tree falls in the forest and no one is there, does it still make a sound.',
  4010: 'Learn to see things as they really are, not as we imagine they are.',
  4100: 'If you chase two rabbits, you will catch neither one.',

  5000: 'Everyone is a moon, and has a dark side which he never shows to anybody.'
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

export const _throw = (status: ErrorCode, context?: object): never => {
  throw new RxifireError(status, context)
}

export const _unreachable = (x: never): never => {
  throw new RxifireError(ErrorCode.UNREACHABLE)
}
