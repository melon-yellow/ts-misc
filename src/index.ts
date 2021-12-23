/*
##########################################################################################################################
#                                                       TS-MISC                                                          #
##########################################################################################################################
#                                                                                                                        #
#                                           Typescript Miscellaneous Library                                             #
#                                                   Author: Anthony                                                      #
#                             ---------------- ------ -- NodeJS -- ------ ----------------                               #
#                                                * Under Development *                                                   #
#                                       https://github.com/melon-yellow/ts-misc                                          #
#                                                                                                                        #
##########################################################################################################################
#                                                      MAIN MODULE                                                       #
##########################################################################################################################
*/

// Imports
import * as logging from './utils/logging.js'
import * as numbers from './utils/numbers.js'
import * as string from './utils/string.js'
import * as handle from './utils/handle.js'
import * as guards from './utils/guards.js'
import * as types from './utils/types.js'
import * as sync from './utils/sync.js'
import * as sets from './utils/sets.js'

/*
##########################################################################################################################
#                                                  MISCELLANEOUS CLASS                                                   #
##########################################################################################################################
*/

// Miscellaneous Class
export default class Miscellaneous {
  // Miscellaneous Set
  logging = logging
  numbers = numbers
  string = string
  handle = handle
  guards = guards
  types = types
  sync = sync
  sets = sets

  // Allow Info Inside Misc
  get misc(): Miscellaneous {
    return this
  }
}

/*
##########################################################################################################################
#                                                         END                                                            #
##########################################################################################################################
*/
