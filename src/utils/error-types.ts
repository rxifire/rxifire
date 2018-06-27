type AsUniqueToken<T extends string> = { __RXIFIRE__: T }
type NoInfo = AsUniqueToken<'no-info'>
type CtxToken = AsUniqueToken<'ctx'>
type ErrorToken = AsUniqueToken<'error'>

// todo: add other fields - link to docs
type TypeError<T, Error, Desc extends String, F$ extends string> =
  Desc & (T extends ErrorToken ? { ERROR: Error } : {})
  & (T extends CtxToken ? { ERROR_CONTEXT: Error } : {})
  & F$

export type InternalError = TypeError<NoInfo, void,
  'Internal Error - this should not happen. Please report it: https://github.com/rxifire/rxifire',
  'Don’t be afraid that you do not know something. Be afraid of not learning about it.'
  >

export type ActionsIOError<Error> = TypeError<ErrorToken, Error,
  'ActionsIO needs to be of the form `[Params, Result, Update | void]`',
  'Our life is shaped by our mind; we become what we think.'
  >
