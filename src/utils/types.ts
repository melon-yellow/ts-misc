/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Imports
import { is } from './guards.js'

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Export Type No-Op
export type As<T> = T

// Export Class No-Op
export class AsIs<T> {
  constructor(obj: T) {
    return obj
  }
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Check if Type A extends Type B
export type Extends<A, B> = A extends B ? true : false

// Generates a Type Error For some Expression Evaluating to False
export type CheckBool<B extends true> = As<B>

// Check if Type A is equal to Type B
export type Equal<A, B> = As<
  As<<T>() => T extends A ? 1 : 2> extends
    As<<T>() => T extends B ? 1 : 2>
      ? true
      : false
>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Intersect Type
export type Intersect<U extends unknown> = As<
  (U extends unknown ? (...args: U[]) => void : never) extends (
    ...args: As<infer A>[]
  ) => void
    ? As<A>
    : never
>

// Join Type
export type Join<T extends unknown> = As<
  [Intersect<T>] extends [infer I]
    ? I extends never
      ? never
      : I extends Extra
      ? {
          [K in KeyOf<I>]: I[K]
        }
      : never
    : never
>

// And Type
export type And<T extends unknown> = As<
  [Intersect<T>] extends [infer I]
    ? I extends never
      ? never
      : I extends Extra
      ? Join<I>
      : I
    : never
>

// Readonly Included Type
export type ReadonlyInclude<T> = T | Readonly<T>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// String-Like Type
export type StringLike = string | number | boolean | bigint

// To-String Type
export type ToString<T extends StringLike> = `${T}`

// String-Concat Type
export type StringConcat<S extends StringLike, C extends StringLike> = `${S}${C}`

// String-Join Helper Type
export type StringJoinHelper<
  T extends unknown[],
  D extends StringLike
> = AsIs<StringJoin<T, D>>

// String-Join Type
export type StringJoin<
  T extends ReadonlyInclude<unknown[]>,
  D extends StringLike
> = As<
  T extends readonly []
    ? ''
    : T extends readonly [StringLike]
      ? `${T[0]}`
      : T extends readonly [StringLike, ...infer U]
        ? `${T[0]}${D}${StringJoin<U, D>}`
        : string
>

// String-Split Type
export type StringSplit<S extends string, D extends StringLike> = As<
  string extends S
    ? string[]
    : S extends ''
      ? []
      : S extends `${infer T}${D}${infer U}`
        ? [T, ...StringSplit<U, D>]
        : [S]
>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Last Item Of Array
export type LastOf<T> = As<
  And<T extends unknown ? () => T : never> extends () => infer R ? R : never
>

// Push Into Last Item of Array
export type Push<T extends unknown[], V> = As<[...T, V]>

// Type-Of Tuple
export type TupleOf<
  T = never,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = As<true extends N ? [] : Push<TupleOf<Exclude<T, L>>, L>>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Pseudo-Class Interface
export interface PseudoClass<N extends string | symbol = string | symbol> {
  [Symbol.hasInstance]: Callable<[instance: unknown], boolean>
  name: N
  new (...args: ArgOf): unknown
}

// Literal-Class Interface
export interface LiteralClass<N extends Types = Types> extends PseudoClass {
  new (...args: ArgOf): Callable<ArgOf, Type<N>>
}

// Class Type
export type Class<N extends string | symbol = string | symbol> = As<
  N extends string
    ? Lowercase<N> extends infer LowerN
      ? LowerN extends Types
        ? LiteralClass<LowerN>
        : PseudoClass<N>
      : never
    : PseudoClass<N>
>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Primitive Types
export type PrimitiveType = string | number | boolean | null | undefined

// Super Type
export type SuperType = Object | String | Number | Boolean | Array<unknown>

// Super-Construct Type
export type SuperConstruct<T> = As<
  T extends string
    ? String
    : T extends number
      ? Number
      : T extends boolean
        ? Boolean
        : T extends unknown[]
          ? Array<unknown>
          : T extends Extra
            ? Object
            : T
>

// Super-Type Constructor
export function SuperConstructor<T>(value: T) {
  return (
    is.string(value)
      ? (new String('' + value))
      : is.number(value)
        ? (new Number(0 + value))
        : is.boolean(value)
          ? (new Boolean(true && value))
          : is.array(value)
            ? (new Array([ ...value ]))
            : is.object(value)
              ? (new Object({ ...value }))
              : value
  ) as SuperConstruct<T>
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Get Primary Types
const primaryPrototype = typeof null
export type PrimaryTypes = typeof primaryPrototype
export type UnusualTypes = keyof UnusualTypesEntries

// Check Primary Types Entries
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CheckPrimaryTypes = CheckBool<
  Extends<{ [P in PrimaryTypes]: PrimaryTypesEntries[P] }, PrimaryTypesEntries>
>

// Set Primary Types Entries
export type PrimaryTypesEntries = As<{
  string: string
  number: number
  bigint: bigint
  boolean: boolean
  symbol: symbol
  undefined: undefined
  object: {}
  function: Callable
}>

// Set Unusual Types Entries
export type UnusualTypesEntries = As<{
  never: never
  unknown: unknown
  null: null
  true: true
  false: false
  array: unknown[]
  promise: Promise<unknown>
  date: Date
  regexp: RegExp
  typeof: Types
  keyof: KeyOf
  class: Class
  any: unknown
}>

// Primary Type Symbols
export type Types = As<PrimaryTypes | UnusualTypes>

// Primary Type Generator
export type PrimaryType<N extends PrimaryTypes = PrimaryTypes> = As<
  ValueOf<{ [P in PrimaryTypes]: N extends P ? PrimaryTypesEntries[P] : never }>
>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type Generator
export type Type<N extends Types = Types> = As<
  N extends UnusualTypes
    ? ValueOf<
        { [P in UnusualTypes]: N extends P ? UnusualTypesEntries[P] : never }
      >
    : N extends PrimaryTypes
    ? PrimaryType<N>
    : never
>

// Type-Name Generator Helper
type TypeOfIterator<V extends unknown, C extends boolean> = As<
  ValueOf<
    {
      [P in PrimaryTypes | UnusualTypes]: As<
        Type<P> extends infer T
          ? unknown extends T
            ? undefined
            : C extends true
              ? Equal<T, V> extends true
                ? P
                : undefined
              : V extends T
                ? P
                : never
          : never
      >
    }
  >
>

// Type-Name Generator
export type TypeOf<V extends unknown = unknown> = As<
  As<
    TypeOfIterator<V, true> extends infer C
      ? C extends undefined
        ? TypeOfIterator<V, false>
        : C
      : never
  > extends infer T
    ? T extends string
      ? T
      : never
    : never
>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Guard Interface
export type TypeGuardLike<A extends ArgOf = ArgOf> = As<
  Callable<[obj: unknown, ...args: A], boolean>
>

// Generic Type-Guard Type
export type TypeGuard<T, A extends ArgOf = ArgOf> = As<
  (obj: unknown, ...args: A) => obj is T
>

// Type Of Guarded Type
export type GuardOf<G extends TypeGuard<unknown>> = As<
  G extends TypeGuard<infer T> ? T : never
>

// Is-Type Type
export type IsType = <T extends Types>(
  obj: unknown,
  typeName: T | T[]
) => obj is Type<T>

// Guards Object Type
export type Guards<K extends Types = Types> = As<
  And<K extends Types ? Has<K, TypeGuard<Type<K>, []>> : never>
>

// Set-Has Guard
type GuardSetHas = <
  O = unknown,
  K extends KeyOf = KeyOf,
  T extends Types = Types
>(
  obj: unknown,
  key: K | K[],
  typeName?: T | T[],
  _oref?: O
) => obj is Has<K, Type<T>, O>

// Set-Every Guard
type GuardSetEvery = <K extends KeyOf, T extends Types>(
  obj: Extra<K>,
  typeName: T | T[]
) => obj is Extra<K, TypeOf<T>>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Recursive-Guards Helper Type
export type UpstreamGuard<
P extends Types,
  G extends TypeGuard<Type, []>,
  H extends boolean
> = As<
  As<
    TypeGuard<GuardOf<G> | Type<P>, []>
  > & As<
    H extends true
      ? ReGuard<P>
      : unknown
  >
>

// Recursive-Guards Property Type
export interface ReGuard<H extends Types = Types> {
  or: SuperGuards<Types, H>
}

// Helper for High-Depth Prevention
export type SuperGuardHelper<H extends Types> = As<
  TypeGuard<Type<H>, []> & ReGuard<H>
>

// Super-Guard Interface
export interface SuperGuard<
  H extends Types = Types
> extends SuperGuardHelper<H> {}

// Super-Guards Object Type
export type SuperGuards<K extends Types = Types, H extends Types = never> = As<
  And<K extends Types ? Has<K, SuperGuard<H | K>> : never>
>

// Is Interface
export interface Is extends IsType, SuperGuards {
  in: GuardSetHas
  every: GuardSetEvery
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Of Primary Key
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KeyOfPrimary = keyof any

// Type-Of Record Key
export type KeyOf<T extends Extra = Extra> = As<
  T extends {
    [P in infer K]: unknown
  }
    ? K & keyof T
    : never
>

// Type-Of Record Value
export type ValueOf<T extends Extra = Extra> = As<
  T extends {
    [P in KeyOf]: infer V
  }
    ? V
    : never
>

// Type-Of Record Entries
export type Entries<
  T extends { [P in KeyOf]: ValueOf } = { [P in KeyOf]: ValueOf }
> = As<
  TupleOf<
    {
      [K in KeyOf<T>]: [K, T[K]]
    }[KeyOf<T>]
  >
>

// Type-Of Entrie Record
export type EntrieOf<T extends [KeyOf, ValueOf][] = [KeyOf, ValueOf][]> = As<
  And<
    T extends (infer V)[]
      ? V extends [KeyOf, ValueOf]
        ? Has<V[0], V[1]>
        : never
      : never
  >
>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Of Indexable Record
export type StringSet<T = ValueOf> = As<{ [x: string]: T }>
export type NumberSet<T = ValueOf> = As<{ [x: number]: T }>
export type AnySet<T = unknown> = As<{
  [x: string]: T
  [x: number]: T
}>

// Type-Of Extendable Record
export type Extra<K extends KeyOfPrimary = KeyOfPrimary, T = unknown> = As<
  { [P in K]: T } & AnySet<T>
>

// Type-Of Has
export type Has<K extends KeyOf, T extends ValueOf = ValueOf, O = unknown> = As<
  And<{ [P in K]: T } & O>
>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Of Function
export type Callable<A extends unknown[] = unknown[], R = unknown> = As<
  (...args: A) => R
>

// Type-Of Function Args
export type ArgOf<F extends Callable = Callable> = As<
  F extends Callable<infer A> ? A : never
>

// Type-Of Function Return
export type ReturnOf<F extends Callable = Callable> = As<ReturnType<F>>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Async Function type
export type Async<
  A extends ArgOf = ArgOf,
  R = unknown
> = As<
  Callable<A, PromiseLike<R>>
>

// Return Type of Promise
export type PromiseThen<T extends PromiseLike<unknown>> = As<
  T extends PromiseLike<infer R> ? R : never
>

// Return Type of Async
export type AsyncThen<T extends Async> = As<
  PromiseThen<ReturnOf<T>>
>

// Return Type of Promise or Async
export type Then<T> = As<
  T extends PromiseLike<unknown>
    ? PromiseThen<T>
    : T extends Async
      ? AsyncThen<T>
      : never
>

// Return Type of Promise
export type PromiseAwait<T> = As<
  T extends PromiseLike<unknown>
    ? PromiseAwait<PromiseThen<T>>
    : T
>

// Return Type of Await Promise or Async
export type Await<T> = As<
  T extends PromiseLike<unknown>
    ? PromiseAwait<T>
    : T extends Async
      ? PromiseAwait<ReturnOf<T>>
      : T
>

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/
