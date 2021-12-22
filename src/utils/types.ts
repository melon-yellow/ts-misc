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
  constructor(obj: T) { return obj }
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Check if Type A extends Type B
export type Extends<A, B> = A extends B ? true : false

// Generates a Type Error For some Expression Evaluating to False
export type CheckBool<B extends true> = B

// Check if Type A is equal to Type B
export type Equal<A, B> = (
  (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2)
      ? true
      : false
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Intersect Type
export type Intersect<U extends unknown> = (
  (U extends unknown ? (...args: U[]) => void : never) extends (
    ...args: (infer A)[]
  ) => void
    ? A
    : never
)

// Join Type
export type Join<T extends unknown> = (
  [Intersect<T>] extends [infer I]
    ? I extends never
      ? never
      : I extends {}
      ? {
          [K in keyof I]: I[K]
        }
      : never
    : never
)

// And Type
export type And<T extends unknown> = (
  [Intersect<T>] extends [infer I]
    ? I extends never
      ? never
      : I extends Set
      ? Join<I>
      : I
    : never
)

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
> = (
  T extends readonly []
    ? ''
    : T extends readonly [StringLike]
      ? `${T[0]}`
      : T extends readonly [StringLike, ...infer U]
        ? `${T[0]}${D}${StringJoin<U, D>}`
        : string
)

// String-Split Type
export type StringSplit<S extends string, D extends StringLike> = (
  string extends S
    ? string[]
    : S extends ''
      ? []
      : S extends `${infer T}${D}${infer U}`
        ? [T, ...StringSplit<U, D>]
        : [S]
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// First Item Of Array
export type ArrayFirst<T extends unknown[]> = (
  T extends [infer F, ...unknown[]] ? F : never
)

// Last Item Of Array
export type ArrayLast<T extends unknown[]> = (
  T extends [...unknown[], infer L] ? L : never
)

// Push Last Item of Array
export type ArrayPush<T extends unknown[], V> = [...T, V]

// Push First Item of Array
export type ArrayPushFirst<T extends unknown[], V> = [V, ...T]

// Pop Last Item of Array
export type ArrayPop<T extends unknown[]> = (
  T extends ArrayPush<infer A, unknown>
    ? A
    : never
)

// Pop First Item of Array
export type ArrayPopFirst<T extends unknown[]> = (
  T extends ArrayPushFirst<infer A, unknown>
    ? A
    : never
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Last Item Of Type Union
export type LastOf<T> = (
  And<
    T extends unknown ? () => T : never
  > extends (() => infer R)
    ? R
    : never
)

// Type-Of Tuple
export type TupleOf<
  T = never,
  L = LastOf<T>,
> = (
  [T] extends [never]
    ? []
    : ArrayPush<
        TupleOf<
          Exclude<T, L>
        >,
        L
      >
)

// Array-Index Type
export type ArrayIndex<K extends KeyOf> = (
  number extends K
    ? never
    : K extends KeyOf<[]>
      ? never
      : K
)

// Object From Array Key-Values
export type ObjectFromArray<A extends unknown[] | {}> = {
  [K in keyof A as ArrayIndex<K>]: A[K]
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Of Entries
export type Entries = [KeyOf, unknown][]

// Type-Of Record Entries
export type EntriesOf<
  T extends {} = Set
> = (
  TupleOf<
    {
      [K in keyof T]: [K, T[K]]
    }[keyof T]
  >
)

// Type-Of Record Entries
export type EntriesOfArray<
  S extends unknown[] | {} = []
> = (
  EntriesOf<ObjectFromArray<S>>
)

// Type-Of Entrie Record
export type ObjectFromEntries<T extends Entries = Entries> = (
  And<
    T extends (infer V)[]
      ? V extends [KeyOf, ValueOf]
        ? Has<V[0], V[1]>
        : never
      : never
  >
)

// Append Items To Array By Entries
export type ArrayAppendEntries<
  T extends Entries,
  A extends unknown[] = [],
> = (
  T extends []
    ? A
    : ArrayFirst<T> extends infer F
      ? ArrayPopFirst<T> extends infer AR
        ? F extends [KeyOf, unknown]
          ? AR extends Entries
            ? ArrayAppendEntries<
              AR,
              ArrayPush<A, F[1]>
            >
            : never
          : never
        : never
      : never
)

// Array Type From Entries
export type ArrayFromEntries<T extends Entries = []> = (
  ObjectFromEntries<T> extends infer O
    ? EntriesOfArray<O> extends infer E
      ? E extends Entries
        ? ArrayAppendEntries<E>
        : never
      : never
    : never
)

export type ArrayFromObject<O extends {}> = (
  EntriesOfArray<O> extends infer E
    ? E extends Entries
      ? ArrayFromEntries<E>
      : never
    : never
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/
interface LoopBackSet<T> {
  [x: string]: T | LoopBack<T>
  [x: number]: T | LoopBack<T>
  [x: symbol]: T | LoopBack<T>
}
type LoopBackArray<T> = (T | LoopBack<T>)[]
export type LoopBack<T> = LoopBackSet<T> | LoopBackArray<T>

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
export type Class<N extends string | symbol = string | symbol> = (
  N extends string
    ? Lowercase<N> extends infer LowerN
      ? LowerN extends Types
        ? LiteralClass<LowerN>
        : PseudoClass<N>
      : never
    : PseudoClass<N>
)

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
export type SuperConstruct<T> = (
  T extends string
    ? String
    : T extends number
      ? Number
      : T extends boolean
        ? Boolean
        : T extends unknown[]
          ? Array<unknown>
          : T extends {}
            ? Object
            : T
)

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
export type UnusualTypes = keyof UnusualTypesList

// Check Primary Types List
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CheckPrimaryTypes = CheckBool<
  Extends<{ [P in PrimaryTypes]: PrimaryTypesList[P] }, PrimaryTypesList>
>

// Set Primary Types List
export interface PrimaryTypesList {
  string: string
  number: number
  bigint: bigint
  boolean: boolean
  symbol: symbol
  undefined: undefined
  object: {}
  function: Callable
}

// Set Unusual Types List
export interface UnusualTypesList {
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
}

// Primary Type Symbols
export type Types = PrimaryTypes | UnusualTypes

// Primary Type Generator
export type PrimaryType<N extends PrimaryTypes = PrimaryTypes> = (
  ValueOf<{ [P in PrimaryTypes]: N extends P ? PrimaryTypesList[P] : never }>
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type Generator
export type Type<N extends Types = Types> = (
  N extends UnusualTypes
    ? ValueOf<
        { [P in UnusualTypes]: N extends P ? UnusualTypesList[P] : never }
      >
    : N extends PrimaryTypes
    ? PrimaryType<N>
    : never
)

// Type-Name Generator Helper
type TypeOfIterator<V extends unknown, C extends boolean> = (
  ValueOf<
    {
      [P in PrimaryTypes | UnusualTypes]: (
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
      )
    }
  >
)

// Type-Name Generator
export type TypeOf<V extends unknown = unknown> = (
  (TypeOfIterator<V, true> extends infer C
      ? C extends undefined
        ? TypeOfIterator<V, false>
        : C
      : never
  ) extends infer T
    ? T extends string
      ? T
      : never
    : never
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Guard Interface
export type TypeGuardLike<A extends ArgOf = ArgOf> = (
  Callable<[obj: unknown, ...args: A], boolean>
)

// Generic Type-Guard Type
export interface TypeGuard<T = unknown, A extends ArgOf = ArgOf> {
  (obj: unknown, ...args: A): obj is T
}

// Type Of Guarded Type
export type TypeFromGuard<G extends TypeGuard> = (
  G extends TypeGuard<infer T> ? T : never
)

// Is-Type Type
export type IsType = <T extends Types>(
  obj: unknown,
  typeName: T | T[]
) => obj is Type<T>

// Guards Object Type
export type Guards<T extends Types = Types> = {
  [K in T]: TypeGuard<Type<K>, []>
}

// Set-Has Guard
export type GuardHas<T> = (
  <K extends KeyOf = never>(
    obj: unknown,
    key: K | K[],
  ) => obj is { [P in K]: T }
)

// Set Object Guard
export type GuardObjectOf<T, H = never> = (
  <O extends ReadonlyInclude<Set> = {}>(
    obj: unknown
  ) => obj is H | And<O | { [K in keyof O]: T }>
)

// Set Array Guard
export type GuardArrayOf<T, H = never> = (
  <A extends ReadonlyInclude<unknown[]> = unknown[]>(
    obj: unknown
  ) => obj is H | And<A &
    A extends (readonly unknown[])
      ? { [K in keyof A]: T }
      : T[]
  >
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Recursive-Guards Property Type
export interface GuardMethods<H> {
  in: GuardHas<H>
  or: (
    (<T>(guard: TypeGuard<T, []>) => SuperGuard<H | T>)
    & SuperGuards<H>
  )
}

// Recursive-Object-Guards Property Type
export interface ObjectGuardMethods<H> {
  of: (<T>(guard: TypeGuard<T, []>) => (GuardObjectOf<T, H> & GuardMethods<{} | H>))
  & { [K in Types]: GuardObjectOf<Type<K>, H> & GuardMethods<{} | H> }
}

// Recursive-Array-Guards Property Type
export interface ArrayGuardMethods<H> {
  of: (<T>(guard: TypeGuard<T, []>) => (GuardArrayOf<T, H> & GuardMethods<T[] | H>))
  & { [K in Types]: GuardArrayOf<Type<K>, H> & GuardMethods<Type<K>[] | H> }
}

// Helper for High-Depth Prevention
type SuperGuardHelper<H> = (
  TypeGuard<H, []> & GuardMethods<H>
)

// Super-Guards Object Type
export type SuperGuardsHelper<H = never> = (
  {
    [K in Types]: SuperGuard<H | Type<K>> & (
      K extends 'array'
        ? ArrayGuardMethods<H>
        : K extends 'object'
          ? ObjectGuardMethods<H>
          : {}
    )
  }
)

// Super-Guard Interface
export interface SuperGuard<H> extends SuperGuardHelper<H> {}

// Super-Guard Interface
export interface SuperGuards<H = never> extends SuperGuardsHelper<H> {}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Guard-Descriptor Type
export type GuardDescriptor<
  S extends ReadonlyInclude<unknown[] | Set> = null
> = (
  S extends null
    ? LoopBack<TypeGuard>
    : {
      [K in keyof S]: (
        S[K] extends (unknown[] | Set)
          ? GuardDescriptor<S[K]>
          : TypeGuard<S[K], []>
      )
    }
)

// Type-Of TypeGuard from Descriptor
export type TypeFromGuardDescriptor<
  D extends GuardDescriptor
> = {
  [K in keyof D]: (
    D[K] extends GuardDescriptor
      ? TypeFromGuardDescriptor<D[K]>
      : D[K] extends TypeGuard
        ? TypeFromGuard<D[K]>
        : never
  )
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Is Interface
export interface Is extends IsType, SuperGuards {
  in: GuardHas<unknown>
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
export type KeyOf<
  T extends ReadonlyInclude<unknown[] | Set> = (unknown[] | Set)
> = (
  T extends {
    [P in infer K]: unknown
  }
    ? K & keyof T
    : never
)

// Type-Of Record Value
export type ValueOf<
  T extends ReadonlyInclude<unknown[] | Set> = (unknown[] | Set)
> = (
  T extends unknown[]
    ? T extends (infer V)[]
      ? V
      : never
    : T extends {
      [P in KeyOf]: infer V
    }
      ? V
      : never
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Of Indexable Record
export interface StringSet<T = unknown> { [x: string]: T }
export interface NumberSet<T = unknown> { [x: number]: T }
export interface Set<T = unknown> {
  [x: string]: T
  [x: number]: T
  [x: symbol]: T
}

// Type-Of Has
export type Has<
  K extends KeyOf,
  T = unknown,
  O extends {} = {}
> = (
  And<O & { [P in K]: T }>
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type-Of Function
export interface Callable<
  A extends unknown[] = unknown[],
  R = unknown
> { (...args: A): R }

// Type-Of Function Args
export type ArgOf<F extends Callable = Callable> = (
  F extends Callable<infer A> ? A : never
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Async Function type
export interface Async<
  A extends ArgOf = ArgOf,
  R = unknown
> extends Callable<A, PromiseLike<R>> {}

// Return Type of Promise
export type PromiseThen<T extends PromiseLike<unknown>> = (
  T extends PromiseLike<infer R> ? R : never
)

// Return Type of Async
export type AsyncThen<T extends Async> = (
  PromiseThen<ReturnType<T>>
)

// Return Type of Promise or Async
export type Then<T> = (
  T extends PromiseLike<unknown>
    ? PromiseThen<T>
    : T extends Async
      ? AsyncThen<T>
      : never
)

// Return Type of Promise
export type PromiseAwait<T> = (
  T extends PromiseLike<unknown>
    ? PromiseAwait<PromiseThen<T>>
    : T
)

// Return Type of Await Promise or Async
export type Await<T> = (
  T extends PromiseLike<unknown>
    ? PromiseAwait<T>
    : T extends Async
      ? PromiseAwait<ReturnType<T>>
      : T
)

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/
