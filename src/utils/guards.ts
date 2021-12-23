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
  TypeFromGuard,
  SuperGuard,
  SuperGuards,
  GuardHas,
  GuardArrayOf,
  GuardObjectOf,
  Callable,
  Class,
  Has,
  KeyOf,
  ArgOf,
  TypeOf,
  Type
} from './types.js'

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// General Make Type-Guard
export function extend<T, O = unknown>(
  obj: unknown
): obj is (T extends {} ? (O extends {} ? And<O & T> : O & T) : O & T) {
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
function setGuard<N extends Types>(
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
  undefined: setGuard('undefined'),
  string: setGuard('string', String),
  number: setGuard('number', Number),
  bigint: setGuard('bigint', BigInt),
  symbol: setGuard('symbol', Symbol),
  object: (o => (setGuard('object', Object)(o) && o)) as TypeGuard<{}>,
  boolean: setGuard('boolean', Boolean),
  function: setGuard('function', Function)
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

// General Type-Guard Target
const superTarget = (() => null) as unknown

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Helper Types
type IterFlag = 'array' | 'object'
type IterSel<I extends IterFlag, AO, A, O, E> = (
  I extends IterFlag
    ? AO
    : I extends 'array'
      ? A
      : I extends 'object'
        ? O
        : E
)

// Check Set Guard Flag
const checkSetFlag = (flag: string): flag is IterFlag => ['array', 'object'].includes(flag)

// Type-Guard Proxy-Function Generator
const upstreamGuardGenerator = <D, G, I extends IterFlag = null>(
  dnstr: TypeGuard<D, []> | null,
  guard: TypeGuard<G, []>,
  iter?: I
): IterSel<
  I,
  GuardArrayOf<G, D> |
  GuardObjectOf<G, D>,
  GuardArrayOf<G, D>,
  GuardObjectOf<G, D>,
  TypeGuard<D | G, []>
> => {
  type IG = IterSel<
    I,
    GuardArrayOf<G, D> |
    GuardObjectOf<G, D>,
    GuardArrayOf<G, D>,
    GuardObjectOf<G, D>,
    never
  >
  // Set Downstream Guard
  const prstr = (o => dnstr ? dnstr(o) : false) as TypeGuard<D, []>
  // Set Upstream Guard
  const upstr = (
    checkSetFlag(iter)
      ? (o => prstr(o) || Object.values(o).every(guard)) as unknown as IG
      : (o => prstr(o) || guard(o)) as TypeGuard<D | G, []>
  ) as IterSel<
    I,
    GuardArrayOf<G, D> |
    GuardObjectOf<G, D>,
    GuardArrayOf<G, D>,
    GuardObjectOf<G, D>,
    TypeGuard<D | G, []>
  >
  // Return Upstream
  return upstr
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Guard Proxy-Function Generator
const superGuardGenerator = <
  G extends TypeGuard<TG, []>,
  I extends IterFlag,
  TG
>(guard: G, iter?: I) => {
  // Return Proxy
  return new Proxy(guard, {
    apply (
      target,
      _thisArg,
      args: [unknown]
    ): args is [TG] {
      if (args.length != 1) throw new Error('invalid arguments')
      const [obj] = args
      return target(obj)
    },
    get (target, p) {
      // Check Target Type
      if (!guards.function(target)) throw new Error(
        'invalid target at SuperGuard proxy'
      )
      // In Clause
      if (p === 'in') return new Proxy(
        superTarget as GuardHas<TG>,
        guardHasProxyHandler(target)
      )
      // Or Clause
      if (p === 'or') return new Proxy(
        superTarget as SuperGuards<TG>,
        guardProxyHandler(target, null)
      )
      // Of Clause
      if (p === 'of' && checkSetFlag(iter)) {
        // Return Proxy
        return new Proxy(
          superTarget as SuperGuards<TG>[I]['of'],
          guardProxyHandler(target, iter)
        )
      }
      // Else
      return target[p]
    }
  }) as unknown as SuperGuard<G>
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Proxy-Handler Helper Type
type UPS<P, H> = P extends Types ? SuperGuard<H | Type<P>> : never

// Type-Guards Proxy-Handler Generator
const guardProxyHandler = <H, I extends IterFlag>(
  dnstr: TypeGuard<H, []> | null,
  iter?: I
): ProxyHandler<
  IterSel<
    I,
    SuperGuards<H>['array']['of'] |
    SuperGuards<H>['object']['of'],
    SuperGuards<H>['array']['of'],
    SuperGuards<H>['object']['of'],
    SuperGuards<H>
  >
> => ({
  // Or Call
  apply<U>(
    _target,
    _thisArg,
    args: [TypeGuard<U, []>]
  ) {
    if (args.length != 1) throw new Error('invalid arguments')
    const [guard] = args
    if (!guards.function(guard)) throw new Error('invalid arguments')
    // Generate Recursive Type-Guard Proxy
    const upstr = upstreamGuardGenerator(dnstr, guard, iter)
    return superGuardGenerator(upstr)
  },
  // Or Get
  get<P extends string | symbol>(
    _target, p: P
  ): UPS<P, H> {
    // Check if property exists
    if (!guards.typeof(p)) throw new Error(`key "${p}" not in SuperGuards`)
    // Get Type-Guard
    const guard = guards[p] as UPS<P, never>
    // Check for Array Or Object
    const flag = checkSetFlag(p) ? p : null
    // Generate Recursive Type-Guard Proxy
    const upstr = upstreamGuardGenerator(dnstr, guard, iter)
    return superGuardGenerator(upstr, flag) as UPS<P, H>
  },
  // General Methods
  set (_target, _p, _value) { return null },
  deleteProperty (_target, _p) { return null },
  defineProperty (_target, _p, _attr) { return null },
  ownKeys (_target) { return Object.keys(guards) },
  has(_target, p) { return p in guards }
})

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Guards Proxy-Handler Generator
const guardHasProxyHandler = <H>(
  guard: TypeGuard<H, []> | null
): ProxyHandler<GuardHas<H>> => ({
  // In Call
  apply<K extends KeyOf>(
    _target,
    _thisArg,
    args: [unknown, K]
  ): args is [{ [P in K]: H }, K] {
    if (args.length != 2) throw new Error('invalid arguments')
    if (guard && !guards.function(guard)) throw new Error('invalid arguments')
    const [obj, key] = args
    // Check For Key and Type
    return has(obj, key, guard)
  },
})

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Recursive Type-Guard Proxy
export const superGuards = new Proxy(
  superTarget as SuperGuards,
  guardProxyHandler(null)
)

// General Type-Guard Proxy
export const is = new Proxy(superGuards as Is, {
  // Get Properties
  get (target, p) {
    // Check Target Type
    if (!guards.function(target)) throw new Error(
      'invalid target at SuperGuard proxy'
    )
    // In Clause
    if (p === 'in') return new Proxy(
      superTarget as GuardHas<unknown>,
      guardHasProxyHandler(null)
    )
    // Else
    return target[p]
  },
  // Property Check
  has(_target, p) { return (p in guards ||
    (guards.string(p) && ['in'].includes(p))
  )}
})

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Has-Property Type-Guard
export function has<
  K extends KeyOf,
  T = unknown
>(
  obj: unknown,
  key: K | K[],
  guard?: TypeGuard<T, []>
): obj is Has<K, T> {
  // Check Object
  if (!guards.object(obj)) return false
  // Set Check Function
  const checkType = <P extends KeyOf>(
    o: unknown, k: P
  ): o is Has<P, T> => {
    return guard ? guard(o[k]) : true
  }
  // Perform Key Check
  const checkKey = (o: {}, k: KeyOf): o is Has<K, T> => {
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
  ): obj is Callable<A, TypeOf<R>> => isType(obj(...args), typeName)

  // Return Type-Guard
  return typeGuard
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/
