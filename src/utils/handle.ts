/*
##########################################################################################################################
#                                                       ACESSORIES                                                       #
##########################################################################################################################
*/

// Imports
import { wait, waitSync } from './sync.js'
import { Await, Callable } from './types.js'

/*
##########################################################################################################################
#                                                          TYPES                                                         #
##########################################################################################################################
*/

// Safe Execution Types
export type TSafeReturn<T> = readonly [T, Error]
export type TSafeAsyncReturn<T> = Promise<TSafeReturn<T>>
export type TSafe<A extends unknown[], R> = Callable<A, TSafeAsyncReturn<R>>
export type TSafeSync<A extends unknown[], R> = Callable<A, TSafeReturn<R>>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Safe Pattern for Error Handling
export function safe<A extends unknown[], T>(
  func: (...args: A) => T,
  that?: unknown
): TSafe<A, Await<T>> {
  // Set Async Function
  const fasync: (...args: A) => Promise<Await<T>> = that
    ? async (...args: A) => await func.call(that, ...args)
    : async (...args: A) => await func(...args)

  // Return Decorated Function
  return async (...args: A) => {
    // Set Variables
    let value: Await<T>
    let error: Error

    // Await Then and Catch
    await new Promise(resolve => {
      // Execute Async Function
      fasync(...args)
        .catch(err => {
          error = err
          resolve(null)
        })
        .then(val => {
          value = val || null
          resolve(null)
        })
    })

    // Return Value and Error
    return [value, error] as const
  }
}

// Safe Pattern for Synchronous Error Handling
export function safeSync<A extends unknown[], T>(
  func: Callable<A, T>,
  that?: unknown
): TSafeSync<A, Await<T>> {
  // Set Async Function
  const safeFunction = safe(func, that)
  // Return Decorated Function
  return (...args: A) => {
    // Execute Async Function
    const promise = safeFunction(...args)
    const resolution = waitSync(promise)
    // Return Value and Error
    return resolution as TSafeReturn<Await<T>>
  }
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Try something
export async function repeat<T>(
  exec: () => T,
  verify: (res: Await<T>) => boolean | Promise<boolean>,
  loop = 10,
  delay = 1
): Promise<Await<T>> {
  // Set Variables
  let i = 0
  const safeFunction = safe(exec)
  const safeVerify = safe(verify)

  // Try Loop
  while (i < loop) {
    // wait delay
    if (i > 0) await wait(delay)
    // execute function
    const [res, error] = await safeFunction()
    // if no error occurred
    if (!error) {
      // execute verify
      const [cond, condError] = await safeVerify(res)
      // check for result
      if (cond && !condError) return res
    }
    i++
  }
  throw Error()
}

// Try Something Synchronously
export function repeatSync<T>(
  exec: () => T,
  verify: (res: Await<T>) => boolean | Promise<boolean>,
  loop = 10,
  delay = 1
): TSafeReturn<Await<T>> {
  const callSync = safeSync(repeat)
  return callSync(exec, verify, loop, delay) as TSafeReturn<Await<T>>
}

/*
##########################################################################################################################
#                                                         END                                                            #
##########################################################################################################################
*/
