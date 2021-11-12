/*
##########################################################################################################################
#                                                       ACESSORIES                                                       #
##########################################################################################################################
*/

// Imports
import { pass } from './utils.js'
import { is } from './guards.js'

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Get Date
export function timestamp(): string {
  return new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Fortaleza'
  })
}

// Wait Seconds
export function wait(mili: number): Promise<null> {
  return new Promise(resolve =>
    setTimeout(v => {
      resolve(v)
    }, mili)
  )
}

// Wait for Promise
function sync<
  P extends Promise<T>,
  T
>(
  promise: P
): T {
  // Set Variables
  let resolution: T = null
  let done = false

  // Execute Async Function
  promise
    .then(val => {
      resolution = val
      done = true
    })
    .catch(_err => {
      done = true
    })

  // While not Done: Pass
  while (!done) pass(null)

  // Return Value
  return resolution
}

// Wait Seconds Sync
export function waitSync<
  T extends number | Promise<R> | (() => Promise<R>),
  R extends (T extends number ? null : unknown)
>(mili: T): R {
  // Wait Each Option
  if (is.number(mili)) return sync(wait(mili))
  if (is.promise(mili)) return sync(mili as Promise<R>)
  if (is.function(mili)) return sync(mili() as Promise<R>)
}

/*
##########################################################################################################################
#                                                         END                                                            #
##########################################################################################################################
*/
