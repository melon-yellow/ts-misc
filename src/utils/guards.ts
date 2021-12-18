/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

import type {
  As,
  Is,
  And,
  Types,
  PrimaryTypes,
  UnusualTypes,
  TypeGuard,
  TypeGuardLike,
  Guards,
  SuperGuard,
  SuperGuards,
  Callable,
  Class,
  Set,
  Has,
  KeyOf,
  ArgOf,
  TypeOf,
  Type,
  TypeFromGuard
} from './types.js'

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// General Make Type-Guard
export function extend<T, O = unknown>(
  obj: unknown
): obj is As<T extends {} ? (O extends {} ? And<O & T> : O & T) : O & T> {
  return true
}

// General Set Type-Guard
export function guard<T>(tg: TypeGuardLike): TypeGuard<T> {
  if (extend<TypeGuard<T>>(tg)) return tg
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Get Type-Of Object using 'ToString' Method
export function typeOf(obj: unknown): string {
  return Object.toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase()
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Check Primary Types
function _setGuard<N extends Types>(
  typeName: N,
  constructor: Callable = null
): TypeGuard<Type<N>, []> {
  // Set Guard
  const tg = obj =>
    // eslint-disable-next-line valid-typeof
    typeof obj === typeName ||
    (constructor ? obj instanceof constructor : obj === undefined)
  // Return As
  return tg as TypeGuard<Type<N>, []>
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Primary Type-Guard Object
export const primaryGuards: Guards<PrimaryTypes> = {
  undefined: _setGuard('undefined'),
  string: _setGuard('string', String),
  number: _setGuard('number', Number),
  bigint: _setGuard('bigint', BigInt),
  symbol: _setGuard('symbol', Symbol),
  object: (o => (o && _setGuard('object', Object)(o) && true)) as TypeGuard<{}>,
  boolean: _setGuard('boolean', Boolean),
  function: _setGuard('function', Function)
}

// Unusual Type-Guard Object
export const unusualGuards: Guards<UnusualTypes> = {
  any: (_obj => true) as TypeGuard<unknown>,
  never: (_obj => false) as TypeGuard<never>,
  unknown: (_obj => true) as TypeGuard<unknown>,
  true: (obj => obj === true) as TypeGuard<true>,
  false: (obj => obj === false) as TypeGuard<false>,
  date: (obj => obj instanceof Date) as TypeGuard<Date>,
  array: (obj => Array.isArray(obj)) as TypeGuard<unknown[]>,
  regexp: (obj => obj instanceof RegExp) as TypeGuard<RegExp>,
  null: (obj => obj === null || obj === undefined) as TypeGuard<null>,
  promise: (obj => obj instanceof Promise) as TypeGuard<Promise<unknown>>,
  typeof: (obj =>
    primaryGuards.string(obj) &&
    (obj in primaryGuards || obj in unusualGuards)) as TypeGuard<Types>,
  keyof: (obj =>
    ['string', 'number', 'symbol'].includes(typeof obj)) as TypeGuard<KeyOf>,
  class: (obj => {
    if (!primaryGuards.function(obj)) return false
    try { Reflect.construct(String, [], obj) }
    catch (_e) { return false }
    return true
  }) as TypeGuard<Class>
}

// General Type-Guard Object
const guards: Guards = {
  ...primaryGuards,
  ...unusualGuards
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Set Functional Type-Guard
export function isType<T extends Types>(
  obj: unknown,
  typeName: T | T[]
): obj is Type<T> {
  // Set Check Function
  const checkType = t => guards[t](obj)
  // Return Check
  if (!guards.array(typeName)) return checkType(typeName)
  else return typeName.some(checkType)
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Guard Proxy-Function Generator
const guardProxy = <
  G extends TypeGuard<unknown, []>
>(
  guard: G,
  join: (upstr: TypeGuard<unknown, []>) => TypeGuard<unknown, []>
) => (new Proxy(guard, {
    apply (target, _thisArg, args: [unknown]) {
      if (args.length != 1) throw new Error('invalid arguments')
      const [obj] = args
      const upstr = join(target)
      return upstr(obj)
    },
    get (target, p) {
      // Check Target Type
      if (!guards.function(target)) throw new Error(
        'invalid target at SuperGuard proxy'
      )
      // Or Clause
      if (p === 'or') return new Proxy(
        {} as SuperGuards,
        guardProxyHandler(target)
      )
      // Else
      return target[p]
    }
  }) as G & SuperGuard<
    TypeFromGuard<G>
  >)

// Type-Guards Proxy-Handler Generator
const guardProxyHandler = <T>(
  dnstr: TypeGuard<T, []>
): ProxyHandler<SuperGuards> => ({
  // Or Call
  apply<U>(
    _target,
    _thisArg,
    args: [TypeGuard<U, []>]
  ): SuperGuard<U | T> {
    if (args.length != 1) throw new Error('invalid arguments')
    const [guard] = args
    if (!guards.function(guard)) throw new Error('invalid arguments')
    // Return Recursive Type-Guard Proxy
    return guardProxy(guard, (grd: typeof guard) => {
      return (o => dnstr(o) || grd(o)) as TypeGuard<U | T, []>
    })
  },
  // Or Get
  get<P extends string | symbol>(
    _target, p: P
  ): P extends Types ? SuperGuard<Type<P> | T> : never {
    // Check if property exists
    if (!guards.typeof(p)) throw new Error(`key "${p}" not in SuperGuards`)
    // Set Recursive Type-Guard
    type UPS = P extends Types ? TypeGuard<Type<P> | T, []> : never
    const guard = guards[p] as P extends Types ? SuperGuard<Type<P>> : never
    // Return Recursive Type-Guard Proxy
    return guardProxy(guard, (grd: typeof guard) => {
      return (o => dnstr(o) || grd(o)) as UPS
    })
  }
})

// Recursive Type-Guard Proxy
export const superGuards = new Proxy(
  {} as SuperGuards,
  guardProxyHandler(null)
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Has-Property Type-Guard
export function has<
  K extends KeyOf = KeyOf,
  T extends Types = Types,
  O extends {} = {},
>(
  obj: {},
  key: K | K[],
  typeName?: T | T[],
  _oref?: O
): obj is Has<K, Type<T>, O> {
  // Check Object
  if (!guards.object(obj)) return false

  // Set Check Function
  const checkType = <K extends KeyOf>(
    o: unknown,
    k: K
  ): o is Has<K, TypeOf<T>, O> => {
    return typeName ? isType(o[k], typeName) : true
  }

  // Perform Key Check
  const checkKey = (o: {}, k: KeyOf): o is Has<K, TypeOf<T>, O> => {
    if (o[k] === undefined) return false
    if (k in o) return checkType(o, k)
    if (Object.prototype.hasOwnProperty.call(o, k)) return checkType(o, k)
    if (guards.string(k) && Object.keys(o).includes(k)) {
      return checkType(o, k)
    } else return false
  }

  // Return Check
  if (!guards.array(key)) return checkKey(obj, key)
  else return key.every(k => checkKey(obj, k))
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Every-Property Type-Guard
export function are<K extends number, T extends Types, O extends {} | unknown[] = {}>(
  obj: {} | unknown[],
  typeName: T | T[],
  _oref?: O
): obj is O extends unknown[] ? Type<T>[] : Set<Type<T>> {
  // Check All
  return Object.values(obj).every(v => isType(v, typeName))
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// General Type-Guard Target
const superTarget = (() => null) as unknown

// General Type-Guard Proxy
export const is = new Proxy(superTarget as Is, {
  // Is-Type Call
  apply(_target, _thisArg, args) {
    if (args.length != 2) throw new Error('invalid arguments')
    const [obj, typeName] = args
    if (!guards.typeof(typeName)) return
    else if (guards.array(typeName)) {
      if (!are(typeName, 'typeof', typeName)) return
    } else return
    return isType(obj, typeName)
  },
  // Property Getters
  get (_target, p) {
    if (p === 'in') return has
    if (p === 'every') return are
    if (p in guards) return superGuards[p]
  },
  // General Methods
  set (_target, _p, _value) { return null },
  deleteProperty (_target, _p) { return null },
  defineProperty (_target, _p, _attr) { return null },
  ownKeys (_target) { return Object.keys(guards) },
  // Property Check
  has(_target, p) {
    return (
      p in guards ||
      (guards.string(p) && ['in', 'every'].includes(p))
    )
  }
})

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Function-Return Type-Guard
export function isReturn<R extends Types>(
  typeName: R
): <A extends ArgOf>(
  obj: Callable<A>,
  ...args: A
) => obj is Callable<A, TypeOf<R>> {
  // Set Type-Guard
  const typeGuard = <A extends ArgOf>(
    obj: Callable<A>,
    ...args: A
  ): obj is Callable<A, TypeOf<R>> => is(obj(...args), typeName)

  // Return Type-Guard
  return typeGuard
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/
