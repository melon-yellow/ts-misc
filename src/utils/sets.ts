/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Imports
import fs from 'fs'
import { is } from './guards.js'
import { safeSync } from './handle.js'
import { SuperConstructor } from './types.js'

// Type Imports
import type {
  As,
  Extra,
  KeyOf,
  ValueOf,
  ReadonlyInclude,
  PrimitiveType,
  SuperType
} from './types.js'

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Get Random Item of Array
export function rand<T extends ValueOf>(
  arr: ReadonlyInclude<Extra<KeyOf, T> | Array<T>>
): T {
  const keys = Object.keys(arr)
  const k = keys[Math.floor(Math.random() * keys.length)]
  return arr[k] as T
}

// Generate new Serial Object
export function generate<T>(
  obj: T,
  replacer?: (key: KeyOf, value: unknown) => unknown
): T {
  return JSON.parse(JSON.stringify(obj, replacer))
}

// Remove Cyclic References from Object
export function serialize<T>(obj: T): T {
  const seen = []
  const getCircularReplacer = (k, value) => {
    if (is.object(value)) {
      if (seen.indexOf(value) !== -1) return
      else seen.push(value)
    }
    return value
  }
  return generate(obj, getCircularReplacer)
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

// Type Parse
export type PrimitiveJSON = As<
| PrimitiveType
| Record<string | number, unknown>
| unknown[]
>

// Access JSON Class
export class AccessJSON {
  path: string

  constructor (path: string) {
    // Assign Path
    this.path = path
  }

  // Read-JSON Method
  read() {
    // Read-File Function
    const readFile = safeSync(
      (_p: string) => fs.readFileSync(_p).toString()
    )
    // Read File
    const [file, readFileError] = readFile(this.path)
    // Parse Json
    let value: PrimitiveJSON = null
    try {
      value = JSON.parse(file) as PrimitiveJSON
    } catch(e) {}
    // Make Return a Object
    const obj = SuperConstructor(value)
    // Return Object
    return [obj, readFileError] as const
  }

  // Read-JSON Method
  write(json: unknown) {
    // Read-File Function
    const writeFile = safeSync(
      (_p: string, _o: string) => fs.writeFileSync(_p, _o)
    )
    // Serialize Object
    const strgfy = JSON.stringify(serialize(json))
    // Write File
    const [none, writeFileError] = writeFile(this.path, strgfy)
    // Return Status
    return true && !writeFileError
  }
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/

export function proxyJSON(path: string) {
  // Define AccessJSON Object
  const file = new AccessJSON(path)
  // Return Proxy
  return new Proxy({}, {
    get(_target, p) {
      const [obj, error] = file.read()
      if (is.null(obj)) return
      return obj[p]
    },
    set(_target, p, value) {
      const [obj, error] = file.read()
      if (is.null(obj)) return
      obj[p] = value
      return file.write(obj)
    },
    deleteProperty(_target, p) {
      const [obj, error] = file.read()
      if (is.null(obj)) return
      delete obj[p]
      return file.write(obj)
    },
    enumerate(_target, p) {
      const [obj, error] = file.read()
      if (is.null(obj)) return
      return Object.keys(obj)
    },
    ownKeys(_target, p) {
      const [obj, error] = file.read()
      if (is.null(obj)) return
      return Object.keys(obj)
    },
    has(_target, p) {
      const [obj, error] = file.read()
      if (is.null(obj)) return
      return p in obj || is.in(obj, p)
    },
    defineProperty(_target, p, desc) {
      const [obj, readRrror] = file.read()
      if (is.null(obj)) return
      if (desc && is.in(desc, 'value')) obj[p] = desc.value
      if (file.write(obj)) return obj
    },
    getOwnPropertyDescriptor(_target, p) {
      const [obj, error] = file.read()
      if (is.null(obj)) return
      const value = obj[p]
      const desc: PropertyDescriptor = {
        value: value,
        writable: true,
        enumerable: true,
        configurable: false
      }
      if (value) return desc
    }
  } as unknown as ProxyHandler<SuperType>)
}

/*
##########################################################################################################################
#                                                       MISCELLANEOUS                                                    #
##########################################################################################################################
*/
