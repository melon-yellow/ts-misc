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
  UpstreamGuard,
  Callable,
  Class,
  Extra,
  Has,
  KeyOf,
  ArgOf,
  TypeOf,
  Type,
  GuardOf
} from './types.js'

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// General Make Type-Guard
export function extend<T, O = unknown>(
  obj: unknown
): obj is As<T extends Extra ? (O extends Extra ? And<O & T> : O & T) : O & T> {
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
function _setGuardCircularReference<
  G extends TypeGuard<Type, []>
>(_func: G) {
  return new Proxy(_func, {
    get (target, p) {
      if (p === 'or') {
        // Check Target Type
        if (!guards.function(target)) return
        // Return Recursive Proxy
        return new Proxy(
          {} as SuperGuards,
          _getUpstreamGuardHandler(target)
        )
      } else return target[p]
    }
  }) as G & SuperGuard<TypeOf<GuardOf<G>>>
}

// Type-Guards Proxy-Handler Generator
function _getUpstreamGuardHandler<
  G extends TypeGuard<Type, []>
>(_dnstr: G): ProxyHandler<SuperGuards> {
  return {
    get<P extends string | symbol>(
      _target, p: P
    ): P extends Types ? UpstreamGuard<P, G, true> : null {
      // Check if property exists
      if (!guards.typeof(p)) return
      // Get Fixed Parameters
      const _guard = guards[p]
      // Set Recursive Type-Guard
      type UPS = P extends Types ? UpstreamGuard<P, G, false> : null
      const _upstr = (o => _dnstr(o) || _guard(o)) as P extends Types ? UPS : null
      // Return Recursive Type-Guard Proxy
      return _setGuardCircularReference(_upstr)
    }
  }
}

// Recursive Type-Guard Proxy
export const superGuards = new Proxy(
  {} as SuperGuards,
  _getUpstreamGuardHandler(guards.never)
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
  O extends Extra = {},
>(obj: unknown, key: K | K[], typeName?: T | T[], _oref?: O): obj is Has<K, Type<T>, O> {
  // Set Check Function
  const checkType = <K extends KeyOf>(
    o: unknown,
    k: K
  ): o is Has<K, TypeOf<T>, O> => {
    return typeName ? isType(o[k], typeName) : true
  }

  // Perform Key Check
  const checkKey = (o: unknown, k: KeyOf): o is Has<K, TypeOf<T>, O> => {
    if (!guards.object(o)) return false
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
export function are<K extends number, T extends Types, O extends Extra | unknown[] = {}>(
  obj: Extra | unknown[],
  typeName: T | T[],
  _oref?: O
): obj is O extends unknown[] ? Type<T>[] : Extra<K, Type<T>> {
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
    if (args.length != 2) return
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
      (guards.string(p) && ['in', 'has'].includes(p))
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
